import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
    View
} from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
import StyledInput from '../../../components/Forms/StyledInput';

const LoginSchema = Yup.object().shape({
    email: Yup.string().email().required(),
    password: Yup.string().required()
})

const LoginForm = ({ initialValues, handleOnSubmit, ...props }) => {


    return (
        <Formik
            initialValues={initialValues}
            onSubmit={handleOnSubmit}
            validationSchema={LoginSchema}
        >
            {({ values, errors, touched, isValid, handleChange, handleSubmit, isSubmitting }) => (
                <View>
                    {errors.authError && (
                        <View>
                            <HelperText type='error'>{errors.authError}</HelperText>
                        </View>
                    )}
                    <StyledInput
                        keyboardType='email-address'
                        value={values.email}
                        mode="outlined"
                        onChangeText={handleChange('email')}
                        placeholder="Email"
                        error={errors.email && touched.email}
                        field={'email'}
                        formik={{ errors, touched }}
                    />
                    <StyledInput
                        secureTextEntry
                        value={values.password}
                        mode="outlined"
                        onChangeText={handleChange('password')}
                        placeholder="Password"
                        error={errors.password && touched.password}
                        field={'password'}
                        formik={{ errors, touched }}
                    />
                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        disabled={!isValid || isSubmitting}
                    >
                        {isSubmitting ? 'Please wait...' : 'Login'}
                    </Button>
                </View>
            )}
        </Formik>
    )
}

export default LoginForm;
