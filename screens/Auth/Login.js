import React, { useState, useContext } from 'react';
import {
    Headline, Text, useTheme
} from 'react-native-paper';
import {
    ScrollView, StyleSheet, View
} from 'react-native';
import LoginForm from './Components/LoginForm';
import Api from '../../helpers/Network';
import { useNavigation } from '@react-navigation/native';import { useAuth } from '../../helpers';
import { AuthContext } from '../../helpers/AuthContext';
;

const Login = () => {

    let [ loginCredentials ] = useState({ email: '', password: '', authError: null });
    let { signIn } = useContext(AuthContext);
    let { reset } = useNavigation();

    const handleOnSubmit = async (values, actions) => {
        try {
            actions.setFieldValue('authError', null);
            let data = new FormData();
            data.append('email', values.email);
            data.append('password', values.password);
            let response = await Api.post('users/login', data);
            await signIn(response.token);

            reset({
                index: 0,
                routes: [{
                    name: 'Shed'
                }]
            });
        } catch (error) {
            console.log(error)
            actions.setFieldValue('authError', error);
            actions.setSubmitting(false);
        }
    }

    return (
        <View style={styles.container}>
            <PageTitle
                title="TSF Grading shed"
                subtitle="Enter you credentials to login"
            />
            <LoginForm initialValues={loginCredentials} handleOnSubmit={handleOnSubmit} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 50,
        paddingHorizontal: 16
    },
    pageTitle: {
        marginBottom: 32
    }
})

export function PageTitle ({ title, subtitle }) {
    let theme = useTheme()
    return (
        <View style={styles.pageTitle}>
            <Headline style={{ color: theme.colors.primary }}>{title}</Headline>
            <Text>{subtitle}</Text>
        </View>
    )
}

export default Login;