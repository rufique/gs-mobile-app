import { StyleSheet, View } from "react-native";
import { HelperText, TextInput } from "react-native-paper";

const StyledInput = ({ field, formik, ...props }) => {
    return (
        <View style={styles.formGroup}>
            <TextInput
                {...props}
            />
            {formik.errors[field] && <HelperText type='error'>{formik.errors[field]}</HelperText>}
        </View>
    )
}

const styles = StyleSheet.create({
    formGroup: {
        marginBottom: 8
    }
});

export default StyledInput;