import "dotenv/config";
import { AddressLike, Signer } from "ethers";
import hre from "hardhat";

// Account config
const OPERATORS_KEY: Array<string> = String(process.env.OPERATORS_KEY).split(
    " "
);
const PROXIES_KEY: Array<string> = String(process.env.PROXIES_KEY).split(" ");
const USERS_KEY: Array<string> = String(process.env.USERS).split(" ");

const operators: Array<Signer> = [];
const proxies: Array<Signer> = [];
const users: Array<Signer> = [];

const operatorsWallet: Array<AddressLike> = [];
const proxiesWallet: Array<AddressLike> = [];
const usersWallet: Array<AddressLike> = [];

export async function loadSignersFromLocal() {
    const accounts: Array<Signer> = await hre.ethers.getSigners();
    for (let i = 0; i < accounts.length; i++) {
        if (i < OPERATORS_KEY.length) {
            operators.push(accounts[i]);
        } else if (
            i >= OPERATORS_KEY.length &&
            i < OPERATORS_KEY.length + PROXIES_KEY.length
        ) {
            proxies.push(accounts[i]);
        } else {
            users.push(accounts[i]);
        }
    }
    return {operators, proxies, users};
}

export async function loadWalletsFromLocal() {
    const accounts: Array<Signer> = await hre.ethers.getSigners();
    for (let i = 0; i < accounts.length; i++) {
        if (i < OPERATORS_KEY.length) {
            operatorsWallet.push(await accounts[i].getAddress());
        } else if (
            i >= OPERATORS_KEY.length &&
            i < OPERATORS_KEY.length + PROXIES_KEY.length
        ) {
            proxiesWallet.push(await accounts[i].getAddress());
        } else {
            usersWallet.push(await accounts[i].getAddress());
        }
    }
    return {operatorsWallet, proxiesWallet, usersWallet};
}