import React, { useState, useEffect, useCallback, useContext } from 'react';
import { ActivityIndicator, Button, Colors, HelperText, List, Modal, Portal, Text, useTheme } from 'react-native-paper';
import { View, Dimensions, ScrollView } from 'react-native';
import { useAuth } from '../../helpers';
import { ToastAndroid } from 'react-native';
import Api from '../../helpers/Network';
import { PageLoader } from '../../components/Loaders';
import RehandlingForm from './components/RehandlingForm';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { INTERNAL_GROWERS } from '../../constants';
import { AuthContext } from '../../helpers/AuthContext';

const { height } = Dimensions.get('window');

// create a dynamic schema here, 
// schema selection depends in selected bale source
const RehandlingSchema = {
    rehandling: Yup.object().shape({
        barcode: Yup.string().required(),
        destination: DestinationSchema,
        reasonForRejection: Yup.object().shape({
            id: Yup.number().required(),
            description: Yup.string().required(),
            symbol: Yup.string().required("reason for rejection is required"),
        }).default({}),
    }),
    "floor sweepings": Yup.object().shape({
        mass: Yup.number().min(30).required().positive().integer(),
        internalGrowers: Yup.string().required(),
        destination: DestinationSchema,
    }),
}

const DestinationSchema = Yup.object().shape({
    id: Yup.number().required(),
    bay: Yup.string().required("destination is required"),
}).default({});

const SimpleBarcodeSchema = Yup.object().shape({
    barcode: Yup.string().min(6).max(16).required('Barcode is required!')
})

const Shed = () => {
    let theme = useTheme();
    // get auth state from our custom hook...
    let { token } = useContext(AuthContext);
    let [resources, updateResources] = useState({
        sources: [],
        destinations: [],
        rejections: []
    });
    let [baleSource, setBaleSource] = useState(null);
    let [initialValues] = useState({
        barcode: '',
        mass: 0,
        growersNumber: '',
        growerSuffix: '',
        groupNumber: '',
        lotNumber: '',
        destination: {},
        reasonForRejection: {},
        internalGrowers: '',
    });
    let [loadingResources, setLoadingResources] = useState(true);
    let [loadingBale, setLoadingBale] = useState(false);
    let [modal, updateModal] = useState({
        visible: false,
        data: 'source'
    })

    const { handleChange, setFieldValue, handleSubmit, isSubmitting, ...formikProps } = useFormik({
        initialValues,
        onSubmit: (values, actions) => submitBaleToShed(values, actions), //submitBaleToShed,
        validationSchema: baleSource ? RehandlingSchema[baleSource] : {}
    })

    const submitBaleToShed = async (values, actions) => {
        try {
            actions.setSubmitting(true)
            let baleData = await formatValues(values, baleSource);
            let response = await Api.post('shed', baleData, token);
            ToastAndroid.show(response.message, ToastAndroid.LONG);
            actions.setSubmitting(false);
        } catch (error) {
            actions.setSubmitting(false)
            ToastAndroid.show(error.message, ToastAndroid.LONG);
        } finally {
            actions.resetForm();
        }
    }

    // format values to be submitted depending on source of bale or form type
    const formatValues = async (values, source) => {
        let formData = new FormData();
        formData.append('source', source);
        formData.append('mass', values.mass);
        formData.append('destination', values.destination.bay);
        if (source === 'rehandling') {
            formData.append('barcode', values.barcode);
            formData.append('reasonForRejection', values.reasonForRejection.symbol);
            formData.append('growersNumber', values.growersNumber);
            formData.append('growerSuffix', values.growerSuffix || "");
            formData.append('groupNumber', values.groupNumber);
            formData.append('lotNumber', values.lotNumber);
            formData.append('originalSource', values.originalSource);
        } else if (source === 'floor sweepings') {
            formData.append('internal_growers', values.internalGrowers);
        } else {
            throw new Error('Unrecognised Form.')
        }
        return formData;

    }

    useEffect(() => {
        // get server resources
        if (token) {
            fetchResources()
        } else {
            ToastAndroid.show("Error: No Auth token", ToastAndroid.LONG);
        }
    }, [token]);

    const fetchResources = useCallback(async () => {
        try {
            setLoadingResources(true)
            const result = await Api.get('shed/resources', token);
            updateResources({
                sources: result.sources,
                destinations: result.destinations,
                rejections: result.rejections
            });
            setLoadingResources(false)
        } catch (e) {
            setLoadingResources(false)
            ToastAndroid.show('Resources error ' + e, ToastAndroid.LONG);
        }
    }, [token])

    const handleSelectBaleSource = source => {
        setBaleSource(source);
        updateModal({
            visible: false,
            data: null
        })
    }

    const handleOnSelect = (values) => {
        let { name, value } = values;
        setFieldValue([name], value);
        updateModal({
            visible: false,
            data: null
        })
    }

    const handleOnScanBale = async barcode => {
        try {
            await SimpleBarcodeSchema.validate({barcode});
            setFieldValue('barcode', barcode);
            setLoadingBale(true)
            let response = await Api.get(`shed/scanned?barcode=${barcode}`, token);
            setFieldValue('barcode', barcode);
            setFieldValue('growersNumber', response.bale.grower_number);
            setFieldValue('growerSuffix', response.bale.grower_suffix);
            setFieldValue('groupNumber', response.bale.group_number);
            setFieldValue('lotNumber', response.bale.lot_number);
            setFieldValue('originalSource', response.bale.source);
            setFieldValue('mass', response.bale.init_mass);
            setLoadingBale(false)
        } catch (error) {
            setLoadingBale(false)
            setFieldValue('barcode', '');
            ToastAndroid.show('Resources error ' + error, ToastAndroid.LONG);
        }
    }

    return (
        <View>
            {loadingResources
                ? <PageLoader loadingText={'Loading Resources, wait...'} />
                : (
                    <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
                        <List.Item
                            title="Source"
                            description={baleSource ?? "Select bale source"}
                            onPress={() => updateModal({
                                visible: true,
                                data: 'source'
                            })}
                            style={{
                                paddingHorizontal: 16,
                            }}
                        >
                        </List.Item>
                        {/* we load forms here */}
                        {baleSource && (
                            <RehandlingForm
                                source={baleSource}
                                onScanBale={handleOnScanBale}
                                setFieldValue={setFieldValue}
                                handleChange={handleChange}
                                {...formikProps}
                            />
                        )}
                        {baleSource && (
                            <>
                                {baleSource !== 'rehandling' && <>
                                    <List.Item
                                        title="Internal Grower"
                                        description={formikProps.values.internalGrowers ? formikProps.values.internalGrowers : "Select Internal Grower"}
                                        onPress={() => updateModal({
                                            visible: true,
                                            data: 'internalGrowers'
                                        })}
                                        style={{
                                            padding: 16,
                                        }}
                                    >
                                    </List.Item>
                                    {formikProps.errors.internalGrowers && <HelperText type='error'>{formikProps.errors.internalGrowers}</HelperText>}
                                </>}
                                <List.Item
                                    title="Destination"
                                    description={('id' in formikProps.values.destination)
                                        ? formikProps.values.destination?.bay
                                        : "Select bale destination"
                                    }
                                    onPress={() => updateModal({
                                        visible: true,
                                        data: 'destination'
                                    })}
                                    style={{
                                        padding: 16,
                                    }}
                                >
                                </List.Item>
                                {(formikProps.errors.destination && 'id' in formikProps.errors?.destination) && <HelperText type='error'>{formikProps.errors.destination?.bay}</HelperText>}
                                {baleSource === 'rehandling' && <>
                                    <List.Item
                                        title="Reason for Rejection"
                                        description={('id' in formikProps.values.reasonForRejection)
                                            ? `${formikProps.values.reasonForRejection?.symbol}: ${formikProps.values.reasonForRejection?.description}`
                                            : "Select reason for rejection"
                                        }
                                        onPress={() => updateModal({
                                            visible: true,
                                            data: 'rejection'
                                        })}
                                        style={{
                                            padding: 16,
                                        }}
                                    >
                                    </List.Item>
                                    {(formikProps.errors.reasonForRejection && 'id' in formikProps.errors?.reasonForRejection) && <HelperText type='error'>{formikProps.errors.reasonForRejection?.symbol}</HelperText>}
                                </>
                                }
                            </>
                        )}
                        <Portal>
                            <Modal visible={loadingBale} contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}>
                                <View style={{ backgroundColor: Colors.white, width: 200, padding: 16 }}>
                                    <ActivityIndicator animating={true} color={theme.colors.primary} />
                                    <Text>Please wait...</Text>
                                </View>
                            </Modal>
                            <Modal visible={modal.visible} contentContainerStyle={{ backgroundColor: Colors.lightGreen100, paddingVertical: 16, maxHeight: height }} style={{ justifyContent: 'flex-end' }}>
                                <ScrollView>
                                    {modal.data === 'source' &&
                                        <List.Section>
                                            <List.Subheader>Pick a source</List.Subheader>
                                            {resources.sources.map(source => {
                                                let isSelected = source.source === 'floor sweepings';
                                                return source.source !== 'suspense' && (
                                                    <List.Item
                                                        key={source.id}
                                                        onPress={() => handleSelectBaleSource(source.source)}
                                                        title={source.source}
                                                    />
                                                )
                                            })}
                                        </List.Section>
                                    }
                                    {
                                        modal.data === 'destination' && (
                                            <List.Section>
                                                <List.Subheader>Pick a Destination</List.Subheader>
                                                {resources.destinations.map(destination => {
                                                    let isSelected = destination.bay === '';
                                                    return (
                                                        <List.Item
                                                            key={destination.id}
                                                            onPress={() => handleOnSelect({ value: destination, name: 'destination' })}
                                                            title={destination.bay}
                                                        />
                                                    )
                                                })}
                                            </List.Section>
                                        )
                                    }
                                    {
                                        modal.data === 'rejection' && (
                                            <List.Section>
                                                <List.Subheader>Pick a Reason for rejection</List.Subheader>
                                                {resources.rejections.map(rejection => {
                                                    let isSelected = rejection.bay === '';
                                                    return (
                                                        <List.Item
                                                            key={rejection.id}
                                                            onPress={() => handleOnSelect({ value: rejection, name: 'reasonForRejection' })}
                                                            title={rejection.symbol}
                                                            description={rejection.description}
                                                        />
                                                    )
                                                })}
                                            </List.Section>
                                        )
                                    }
                                    {
                                        modal.data === 'internalGrowers' && (
                                            <List.Section>
                                                <List.Subheader>Pick an Internal Growers</List.Subheader>
                                                {INTERNAL_GROWERS.map(grower => {
                                                    let isSelected = grower === '';
                                                    return (
                                                        <List.Item
                                                            key={grower}
                                                            onPress={() => handleOnSelect({ value: grower, name: 'internalGrowers' })}
                                                            title={grower}
                                                        />
                                                    )
                                                })}
                                            </List.Section>
                                        )
                                    }
                                </ScrollView>
                                <Button onPress={() => updateModal({
                                    visible: false,
                                    data: null
                                })}>Cancel</Button>
                            </Modal>
                        </Portal>
                        {baleSource && (
                            <View style={{ marginTop: 8, paddingHorizontal: 16 }}>
                                <Button
                                    mode="contained"
                                    onPress={handleSubmit}
                                    loading={isSubmitting}
                                    contentStyle={{ paddingVertical: 4 }}
                                >Save to Shed</Button>
                            </View>
                        )}
                    </ScrollView>
                )}
        </View>
    )
}

export default Shed;