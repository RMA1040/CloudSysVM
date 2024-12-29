export interface Character {
  ID: string;
  Names: string;
  Description: string;
  Age: number;
  isAlive: boolean;
  Birthday: string;
  imageUrl: string;
  abilities: string[];
  Elements: string;
  Weapons: Weapon;
}

export interface Weapon {
  weapon_name: string;
  imageUrl: string;
  weapon_id: string;
  weapon_power: number;
  Origin: string;
  description: string;
  downside: string;
}
