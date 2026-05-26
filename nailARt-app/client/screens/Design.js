import React, { useState } from "react";
import {
    View, StyleSheet, SafeAreaView, TouchableOpacity,
    Text, Image, ScrollView
} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import theme from "../styles/theme.style";
import FooterList from "../components/footer/FooterList";
import back_hand from "../assets/back_hand.png";
import AppLoading from "expo-app-loading";

const FINGERS = ['thumb', 'pointer', 'middle', 'ring', 'pinky'];

const Design = ({ navigation }) => {
    let [fontsLoaded] = theme.useFonts();
    const [selectedImage, setSelectedImage] = useState(null);
    const [appliedNails, setAppliedNails] = useState({});
    const [selectedFinger, setSelectedFinger] = useState(null);

    const nailsets = [
        require('../assets/nail-sets/nails1.png'),
        require('../assets/nail-sets/nails2.png'),
        require('../assets/nail-sets/nails3.png'),
        require('../assets/nail-sets/nails4.png'),
        require('../assets/nail-sets/nails5.png'),
        require('../assets/nail-sets/nails6.png'),
    ];

    const applyToAll = () => {
        if (!selectedImage) return;
        const all = {};
        FINGERS.forEach(f => { all[f] = selectedImage; });
        setAppliedNails(all);
    };

    const clearAll = () => {
        setAppliedNails({});
        setSelectedImage(null);
        setSelectedFinger(null);
    };

    const handleFingerPress = (finger) => {
        setSelectedFinger(finger);
        if (selectedImage) {
            setAppliedNails(prev => ({ ...prev, [finger]: selectedImage }));
        }
    };

    const step = !selectedImage ? 1 : !selectedFinger ? 2 : 3;

    if (!fontsLoaded) return <AppLoading />;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <FontAwesome5 name="chevron-left" size={16} color={theme.colors.hot_pink} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.title}>✦ design</Text>
                    <Text style={styles.subtitle}>nail studio</Text>
                </View>
                <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
                    <Text style={styles.clearText}>clear</Text>
                </TouchableOpacity>
            </View>

            {/* Step indicator */}
            <View style={styles.steps}>
                {[
                    { n: 1, label: 'pick design' },
                    { n: 2, label: 'tap finger' },
                    { n: 3, label: 'done!' },
                ].map(s => (
                    <View key={s.n} style={styles.stepItem}>
                        <View style={[styles.stepDot, step >= s.n && styles.stepDotActive]}>
                            <Text style={[styles.stepNum, step >= s.n && styles.stepNumActive]}>{s.n}</Text>
                        </View>
                        <Text style={[styles.stepLabel, step >= s.n && styles.stepLabelActive]}>{s.label}</Text>
                    </View>
                ))}
            </View>

            {/* Hand canvas */}
            <View style={styles.handCanvas}>
                <Image style={styles.hand} source={back_hand} />

                {/* Finger touch targets */}
                <View style={[styles.fingerTarget, styles.thumbPos]}>
                    <TouchableOpacity
                        style={[styles.fingerBtn, selectedFinger === 'thumb' && styles.fingerBtnActive]}
                        onPress={() => handleFingerPress('thumb')}
                    >
                        {appliedNails['thumb'] && (
                            <Image source={appliedNails['thumb']} style={styles.nailOverlay} />
                        )}
                    </TouchableOpacity>
                </View>

                <View style={[styles.fingerTarget, styles.pointerPos]}>
                    <TouchableOpacity
                        style={[styles.fingerBtn, selectedFinger === 'pointer' && styles.fingerBtnActive]}
                        onPress={() => handleFingerPress('pointer')}
                    >
                        {appliedNails['pointer'] && (
                            <Image source={appliedNails['pointer']} style={styles.nailOverlay} />
                        )}
                    </TouchableOpacity>
                </View>

                <View style={[styles.fingerTarget, styles.middlePos]}>
                    <TouchableOpacity
                        style={[styles.fingerBtn, selectedFinger === 'middle' && styles.fingerBtnActive]}
                        onPress={() => handleFingerPress('middle')}
                    >
                        {appliedNails['middle'] && (
                            <Image source={appliedNails['middle']} style={styles.nailOverlay} />
                        )}
                    </TouchableOpacity>
                </View>

                <View style={[styles.fingerTarget, styles.ringPos]}>
                    <TouchableOpacity
                        style={[styles.fingerBtn, selectedFinger === 'ring' && styles.fingerBtnActive]}
                        onPress={() => handleFingerPress('ring')}
                    >
                        {appliedNails['ring'] && (
                            <Image source={appliedNails['ring']} style={styles.nailOverlay} />
                        )}
                    </TouchableOpacity>
                </View>

                <View style={[styles.fingerTarget, styles.pinkyPos]}>
                    <TouchableOpacity
                        style={[styles.fingerBtn, selectedFinger === 'pinky' && styles.fingerBtnActive]}
                        onPress={() => handleFingerPress('pinky')}
                    >
                        {appliedNails['pinky'] && (
                            <Image source={appliedNails['pinky']} style={styles.nailOverlay} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Design picker */}
            <View style={styles.picker}>
                <View style={styles.pickerHeader}>
                    <Text style={styles.pickerTitle}>choose design</Text>
                    {selectedImage && (
                        <TouchableOpacity onPress={applyToAll} style={styles.applyAllBtn}>
                            <Text style={styles.applyAllText}>apply all</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.pickerScroll}
                >
                    {nailsets.map((image, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => setSelectedImage(image)}
                            style={[
                                styles.designThumb,
                                selectedImage === image && styles.designThumbSelected,
                            ]}
                        >
                            <Image source={image} style={styles.designThumbImage} />
                            {selectedImage === image && (
                                <View style={styles.selectedBadge}>
                                    <FontAwesome5 name="check" size={8} color="#fff" />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FooterList />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.primary_bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 6,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.pink_border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontFamily: 'SourceSerifPro_900Black',
        color: theme.colors.hot_pink,
        letterSpacing: 1,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 11,
        fontFamily: 'SourceSansPro_300Light',
        color: theme.colors.text_secondary,
        textTransform: 'uppercase',
        letterSpacing: 2,
        textAlign: 'center',
    },
    clearBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.pink_border,
    },
    clearText: {
        fontSize: 12,
        color: theme.colors.text_secondary,
        fontFamily: 'SourceSansPro_400Regular',
    },
    steps: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    stepItem: {
        alignItems: 'center',
        gap: 4,
    },
    stepDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.pink_border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepDotActive: {
        backgroundColor: theme.colors.hot_pink,
        borderColor: theme.colors.hot_pink,
        shadowColor: theme.colors.hot_pink,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 6,
    },
    stepNum: {
        fontSize: 12,
        fontFamily: 'SourceSansPro_700Bold',
        color: theme.colors.text_secondary,
    },
    stepNumActive: {
        color: theme.colors.white,
    },
    stepLabel: {
        fontSize: 10,
        fontFamily: 'SourceSansPro_400Regular',
        color: theme.colors.text_secondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    stepLabelActive: {
        color: theme.colors.soft_pink,
    },
    handCanvas: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    hand: {
        width: 320,
        height: 320,
        resizeMode: 'contain',
    },
    fingerTarget: {
        position: 'absolute',
    },
    fingerBtn: {
        width: 38,
        height: 55,
        borderRadius: 19,
        borderWidth: 1.5,
        borderColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
    },
    fingerBtnActive: {
        borderColor: theme.colors.hot_pink,
        shadowColor: theme.colors.hot_pink,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
    },
    nailOverlay: {
        position: 'absolute',
        width: 60,
        height: 90,
        resizeMode: 'contain',
        top: -30,
        left: -11,
        zIndex: 1,
    },
    thumbPos: { top: '42%', left: '12%', transform: [{ rotate: '-25deg' }] },
    pointerPos: { top: '10%', left: '36%' },
    middlePos: { top: '2%', left: '50%' },
    ringPos: { top: '8%', left: '64%' },
    pinkyPos: { top: '20%', left: '78%' },
    picker: {
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.pink_border,
        paddingTop: 12,
        paddingBottom: 90,
    },
    pickerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    pickerTitle: {
        fontSize: 13,
        fontFamily: 'SourceSansPro_600SemiBold',
        color: theme.colors.text_primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    applyAllBtn: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        backgroundColor: theme.colors.hot_pink,
        borderRadius: 12,
    },
    applyAllText: {
        fontSize: 12,
        fontFamily: 'SourceSansPro_700Bold',
        color: theme.colors.white,
        letterSpacing: 0.5,
    },
    pickerScroll: {
        paddingHorizontal: 20,
        gap: 10,
    },
    designThumb: {
        width: 64,
        height: 96,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
        backgroundColor: theme.colors.card_bg,
    },
    designThumbSelected: {
        borderColor: theme.colors.hot_pink,
        shadowColor: theme.colors.hot_pink,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
    },
    designThumbImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    selectedBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: theme.colors.hot_pink,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Design;
