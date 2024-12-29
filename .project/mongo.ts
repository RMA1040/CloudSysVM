import { MongoClient, ServerApiVersion, Collection, Db } from "mongodb";
import dotenv from "dotenv";
import { Character } from './interfaces';
import fs from 'fs';
import path from 'path';
import bcrypt from "bcrypt";
import { User, Role } from "./types";

dotenv.config();

const saltRounds: number = 10;
let db: Db;

// Collections
export let characterCollection: Collection<Character>;
export let userCollection: Collection<User>;

// MongoDB URI
export const uri = process.env.MONGODB_URI || "";

// Initialize database connection
async function connect() {
    try {
        const client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
            tls: process.env.ssl === 'true', // Use SSL/TLS if specified in .env
            tlsAllowInvalidCertificates: false, // Set this to true if using self-signed certificates
        });
        await client.connect();
        db = client.db("login-express"); // Replace with your actual database name
        characterCollection = db.collection<Character>("characters");
        userCollection = db.collection<User>("users");
        console.log('Connected to database');
    } catch (err) {
        if (err instanceof Error) {
            console.error('Error connecting to db:', err.message);
        } else {
            console.error('Unknown error:', err);
        }
        throw err;
    }
}

// Initialize character data
async function initializeData() {
    try {
        const filePath = path.join(__dirname, 'json', 'characters.json');
        const data = fs.readFileSync(filePath, 'utf-8');
        const characters: Character[] = JSON.parse(data);

        const count = await characterCollection.countDocuments();
        if (count === 0) {
            console.log("Inserting data from characters.json into the characters collection...");
            await characterCollection.insertMany(characters);
            console.log("Data inserted successfully.");
        } else {
            console.log(`Number of documents in 'characters' collection: ${count}`);
        }
    } catch (e) {
        console.error("Error initializing data:", e);
    }
}

// Create initial users
async function createInitialUsers() {
    if (await userCollection.countDocuments() > 0) {
        return;
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const userEmail = process.env.USER_EMAIL;
    const userPassword = process.env.USER_PASSWORD;

    if (!adminEmail || !adminPassword || !userEmail || !userPassword) {
        throw new Error("All user-related environment variables must be set");
    }

    const users = [
        {
            email: adminEmail,
            password: await bcrypt.hash(adminPassword, saltRounds),
            role: Role.ADMIN
        },
        {
            email: userEmail,
            password: await bcrypt.hash(userPassword, saltRounds),
            role: Role.USER
        }
    ];

    await userCollection.insertMany(users);
}

// Exported functions
export async function getCharacters() {
    if (!characterCollection) {
        throw new Error("Character collection is not initialized");
    }
    const characters = await characterCollection.find({}).toArray();
    console.log("Fetched characters:", characters);
    return characters;
}

export async function deleteCharacter(id: string) {
    return await characterCollection.deleteOne({ ID: id });
}

export async function updateCharacter(id: string, character: Character) {
    return await characterCollection.updateOne({ ID: id }, { $set: character });
}

export async function login(email: string, password: string) {
    if (email === "" || password === "") {
        throw new Error("Email and password required");
    }
    let user: User | null = await userCollection.findOne<User>({ email: email });
    if (user) {
        console.log(`User found: ${user.email}`); 
        console.log(`Comparing passwords for user: ${user.email}`);
        if (await bcrypt.compare(password, user.password!)) {
            console.log(`Password match for user: ${user.email}`);
            return user;
        } else {
            console.log(`Password mismatch for user: ${user.email}`);
            throw new Error("Password incorrect");
        }
    } else {
        console.log(`User not found: ${email}`);
        throw new Error("User not found");
    }
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
    return await userCollection.findOne({ email });
};

export { connect, initializeData, createInitialUsers };
