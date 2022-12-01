import React from 'react';
import { Text } from "react-native-paper";
import { View } from "react-native";

export const PageLoader = ({ loadingText }) => (
    <View style={{flex: 1, paddingVertical: 32, justifyContent: "center", alignItems: "center", display: "flex"}}>
        <Text>{loadingText}</Text>
    </View>
)