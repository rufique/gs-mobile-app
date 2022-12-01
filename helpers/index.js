import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Alert } from 'react-native';

let authToken = '@shed-user';

export const useAuth = () => {

    const storage = useAsyncStorage(authToken);

    const saveAuthToken = async (token) => {
        try {
            await storage.setItem(token);
        } catch (error) {
            throw error;
        }
    }

    const getAuthToken = async () => {
        try {
            let token = await storage.getItem();
            return token
        } catch (error) {
            throw error;
        }
    }

    return { saveAuthToken, getAuthToken };
}