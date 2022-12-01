import React from 'react';
import {
    View
} from 'react-native';
import { Colors, HelperText } from 'react-native-paper';
import StyledInput from '../../../components/Forms/StyledInput';

const RehandlingForm = ({ source, onScanBale, handleChange, setFieldValue, ...formikProps }) => {

    const { values, errors, touched } = formikProps;

    return (
        <View>
            <View style={{ backgroundColor: Colors.white, padding: 16 }}>
                {/* scan bale */}
                {values.baleError && <HelperText>{values.baleError}</HelperText>}
                {source !== 'rehandling'
                ? <StyledInput
                    dense
                    keyboardType="numeric"
                    value={values.mass}
                    mode="outlined"
                    autoFocus
                    onChangeText={handleChange('mass')}
                    placeholder="Bale Mass"
                    showSoftInputOnFocus={false}
                    error={errors.mass && touched.mass}
                    field={'mass'}
                    formik={{ errors, touched }}
                /> 
                : <>
                    <StyledInput
                        dense
                        value={values.barcode}
                        mode="outlined"
                        onChangeText={val => onScanBale(val)}
                        placeholder="Barcode"
                        autoFocus
                        showSoftInputOnFocus={false}
                        error={errors.barcode && touched.barcode}
                        field={'barcode'}
                        formik={{ errors, touched }}
                    />
                    <View style={{ paddingHorizontal: 8 }}>
                        <HelperText>Grower Number: {values.growersNumber}</HelperText>
                        <HelperText>Grower Suffix: {values.growersSuffix}</HelperText>
                        <HelperText>Group Number: {values.groupNumber}</HelperText>
                        <HelperText>Lot Number: {values.lotNumber}</HelperText>
                        <HelperText>Mass: {values.mass}</HelperText>
                        <HelperText>Original Source: {values.originalSource}</HelperText>
                    </View>
                </>
                }
            </View>
        </View>
    )
}

export default RehandlingForm;