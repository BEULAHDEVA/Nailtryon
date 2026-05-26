import {
    StyleSheet, Text, View, TouchableOpacity, Image,
    SafeAreaView, ScrollView, Modal
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import FooterList from "../components/footer/FooterList";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../context/auth";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import * as ImagePicker from "expo-image-picker";
import theme from "../styles/theme.style";
import { LinkContext } from "../context/link";
import { BlurView } from 'expo-blur';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs();

const Account = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [image, setImage] = useState({ url: "", public_id: "" });
    const [state, setState] = useContext(AuthContext);
    const [uploadImage, setUploadImage] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [links, setLinks] = useContext(LinkContext);

    useEffect(() => {
        if (state && state.user) {
            const { name, email, role, image } = state.user;
            setName(name);
            setEmail(email);
            setRole(role);
            setImage(image);
        }
    }, [state]);

    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = async () => {
        try {
            const { data } = await axios.get("http://localhost:8000/api/links");
            setLinks(data);
        } catch (e) { }
    };

    const handleImagePress = (img) => {
        setSelectedImage(img);
        setModalVisible(true);
    };

    const handleUpload = async () => {
        let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            alert("Permission to access camera roll is required!");
            return;
        }
        let pickerResult = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            base64: true,
        });
        if (pickerResult.canceled) return;

        let base64Image = `data:image/jpg;base64,${pickerResult.base64}`;
        setUploadImage(base64Image);

        let storedData = await AsyncStorage.getItem("auth-rn");
        const parsed = JSON.parse(storedData);
        const { data } = await axios.post("http://localhost:8000/api/upload-image", {
            image: base64Image,
            user: parsed.user,
        });
        const stored = JSON.parse(await AsyncStorage.getItem("auth-rn"));
        stored.user = data;
        await AsyncStorage.setItem("auth-rn", JSON.stringify(stored));
        setState({ ...state, user: data });
        setImage(data.image);
    };

    const signOut = async () => {
        setState({ user: "", token: "" });
        await AsyncStorage.removeItem("auth-rn");
    };

    const nailsets = [
        require('../assets/nail-sets/nails1.png'),
        require('../assets/nail-sets/nails2.png'),
        require('../assets/nail-sets/nails3.png'),
        require('../assets/nail-sets/nails4.png'),
        require('../assets/nail-sets/nails5.png'),
        require('../assets/nail-sets/nails6.png'),
    ];

    const avatarSource = image && image.url
        ? { uri: image.url }
        : uploadImage
            ? { uri: uploadImage }
            : null;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>✦ profile</Text>
                <TouchableOpacity onPress={signOut} style={styles.signOutBtn}>
                    <FontAwesome5 name="sign-out-alt" size={18} color={theme.colors.text_secondary} />
                </TouchableOpacity>
            </View>

            {/* Profile card */}
            <View style={styles.profileCard}>
                <TouchableOpacity onPress={handleUpload} style={styles.avatarWrap}>
                    {avatarSource ? (
                        <Image source={avatarSource} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <FontAwesome5 name="camera" size={22} color={theme.colors.hot_pink} />
                        </View>
                    )}
                    <View style={styles.cameraOverlay}>
                        <FontAwesome5 name="camera" size={10} color={theme.colors.white} />
                    </View>
                </TouchableOpacity>

                <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{name || "your name"}</Text>
                    <Text style={styles.profileEmail}>{email}</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Text style={styles.statNum}>21</Text>
                            <Text style={styles.statLabel}>designs</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.stat}>
                            <Text style={styles.statNum}>105</Text>
                            <Text style={styles.statLabel}>followers</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Quick actions */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("Saved")}>
                    <FontAwesome5 name="bookmark" solid size={16} color={theme.colors.hot_pink} />
                    <Text style={styles.actionBtnText}>saved</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("SeeNails")}>
                    <FontAwesome5 name="hand-sparkles" solid size={16} color={theme.colors.hot_pink} />
                    <Text style={styles.actionBtnText}>try on</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("Design")}>
                    <FontAwesome5 name="palette" solid size={16} color={theme.colors.hot_pink} />
                    <Text style={styles.actionBtnText}>design</Text>
                </TouchableOpacity>
            </View>

            {/* Posts grid */}
            <Text style={styles.sectionTitle}>my designs</Text>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
                {(links && links.length > 0 ? links : nailsets).map((item, index) => (
                    <TouchableOpacity
                        key={item._id || index}
                        style={styles.gridItem}
                        onPress={() => handleImagePress(nailsets[index % nailsets.length])}
                    >
                        <Image
                            style={styles.gridImage}
                            source={nailsets[index % nailsets.length]}
                        />
                        <View style={styles.gridOverlay}>
                            <FontAwesome5 name="bookmark" solid size={12} color={theme.colors.hot_pink} />
                        </View>
                    </TouchableOpacity>
                ))}
                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Image modal */}
            <Modal visible={modalVisible} transparent>
                <BlurView style={StyleSheet.absoluteFill} intensity={60} tint="dark">
                    <TouchableOpacity
                        style={styles.modalBg}
                        onPress={() => setModalVisible(false)}
                        activeOpacity={1}
                    >
                        <View style={styles.modalCard}>
                            <Image source={selectedImage} style={styles.modalImage} />
                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.modalBtn} onPress={() => setModalVisible(false)}>
                                    <FontAwesome5 name="times" size={16} color={theme.colors.text_secondary} />
                                    <Text style={styles.modalBtnText}>close</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary]}>
                                    <FontAwesome5 name="bookmark" solid size={16} color={theme.colors.white} />
                                    <Text style={[styles.modalBtnText, { color: theme.colors.white }]}>save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </BlurView>
            </Modal>

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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 8,
    },
    title: {
        fontSize: 26,
        fontFamily: 'SourceSerifPro_900Black',
        color: theme.colors.hot_pink,
        letterSpacing: 1,
    },
    signOutBtn: {
        padding: 8,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 16,
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.pink_border,
    },
    avatarWrap: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: theme.colors.hot_pink,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.card_bg,
        borderWidth: 2,
        borderColor: theme.colors.hot_pink,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.hot_pink,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 20,
        fontFamily: 'SourceSerifPro_700Bold',
        color: theme.colors.text_primary,
        marginBottom: 2,
    },
    profileEmail: {
        fontSize: 12,
        fontFamily: 'SourceSansPro_400Regular',
        color: theme.colors.text_secondary,
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stat: {
        alignItems: 'center',
    },
    statNum: {
        fontSize: 18,
        fontFamily: 'SourceSerifPro_700Bold',
        color: theme.colors.hot_pink,
    },
    statLabel: {
        fontSize: 10,
        fontFamily: 'SourceSansPro_400Regular',
        color: theme.colors.text_secondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statDivider: {
        width: 1,
        height: 28,
        backgroundColor: theme.colors.pink_border,
        marginHorizontal: 16,
    },
    actions: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 16,
        gap: 10,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        backgroundColor: theme.colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.colors.pink_border,
    },
    actionBtnText: {
        fontSize: 12,
        fontFamily: 'SourceSansPro_600SemiBold',
        color: theme.colors.soft_pink,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionTitle: {
        fontSize: 13,
        fontFamily: 'SourceSansPro_600SemiBold',
        color: theme.colors.text_secondary,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginHorizontal: 24,
        marginBottom: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        gap: 10,
    },
    gridItem: {
        width: '47%',
        aspectRatio: 1,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.pink_border,
    },
    gridImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    gridOverlay: {
        position: 'absolute',
        bottom: 8,
        right: 8,
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
    modalActions: {
        flexDirection: 'row',
        padding: 16,
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
        fontSize: 14,
        fontFamily: 'SourceSansPro_600SemiBold',
        color: theme.colors.text_secondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});

export default Account;
