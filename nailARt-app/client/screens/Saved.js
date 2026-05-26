import React, { useState } from "react";
import {
    View, StyleSheet, SafeAreaView, TouchableOpacity,
    Text, Image, ScrollView, Modal
} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import theme from "../styles/theme.style";
import { BlurView } from 'expo-blur';
import AppLoading from "expo-app-loading";

const Saved = ({ navigation }) => {
    let [fontsLoaded] = theme.useFonts();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const nailsets = [
        require('../assets/nail-sets/nails1.png'),
        require('../assets/nail-sets/nails2.png'),
        require('../assets/nail-sets/nails3.png'),
        require('../assets/nail-sets/nails4.png'),
        require('../assets/nail-sets/nails5.png'),
        require('../assets/nail-sets/nails6.png'),
    ];

    const handleImagePress = (image) => {
        setSelectedImage(image);
        setModalVisible(true);
    };

    if (!fontsLoaded) return <AppLoading />;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <FontAwesome5 name="chevron-left" size={16} color={theme.colors.hot_pink} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.title}>✦ saved</Text>
                    <Text style={styles.subtitle}>your collection</Text>
                </View>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
                {nailsets.map((nailset, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.gridItem}
                        onPress={() => handleImagePress(nailset)}
                        activeOpacity={0.85}
                    >
                        <Image style={styles.gridImage} source={nailset} />
                        <View style={styles.gridBadge}>
                            <FontAwesome5 name="bookmark" solid size={10} color={theme.colors.hot_pink} />
                        </View>
                    </TouchableOpacity>
                ))}
                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Image modal */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <BlurView style={StyleSheet.absoluteFill} intensity={60} tint="dark">
                    <TouchableOpacity
                        style={styles.modalBg}
                        onPress={() => setModalVisible(false)}
                        activeOpacity={1}
                    >
                        <View style={styles.modalCard}>
                            <Image source={selectedImage} style={styles.modalImage} />
                            <View style={styles.modalFooter}>
                                <TouchableOpacity style={styles.modalBtn} onPress={() => setModalVisible(false)}>
                                    <FontAwesome5 name="times" size={14} color={theme.colors.text_secondary} />
                                    <Text style={styles.modalBtnText}>close</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary]}>
                                    <FontAwesome5 name="share-square" solid size={14} color={theme.colors.white} />
                                    <Text style={[styles.modalBtnText, { color: theme.colors.white }]}>share</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </BlurView>
            </Modal>
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
        paddingTop: 12,
        paddingBottom: 16,
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
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 12,
    },
    gridItem: {
        width: '46%',
        aspectRatio: 0.85,
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.pink_border,
        backgroundColor: theme.colors.card_bg,
    },
    gridImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    gridBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.pink_border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBg: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCard: {
        width: '85%',
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.pink_border,
    },
    modalImage: {
        width: '100%',
        aspectRatio: 1,
        resizeMode: 'cover',
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 14,
        gap: 10,
    },
    modalBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.colors.pink_border,
    },
    modalBtnPrimary: {
        backgroundColor: theme.colors.hot_pink,
        borderColor: theme.colors.hot_pink,
    },
    modalBtnText: {
        fontSize: 13,
        fontFamily: 'SourceSansPro_600SemiBold',
        color: theme.colors.text_secondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});

export default Saved;
