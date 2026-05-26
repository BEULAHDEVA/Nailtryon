import {
    StyleSheet, Text, SafeAreaView, ScrollView, View,
    TouchableOpacity, Image, Share, Alert
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { LinkContext } from "../context/link";
import axios from "axios";
import FooterList from "../components/footer/FooterList";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import theme from "../styles/theme.style";
import AppLoading from "expo-app-loading";
import { AuthContext } from "../context/auth";
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']);

const Home = ({ navigation }) => {
    let [fontsLoaded] = theme.useFonts();
    const [links, setLinks] = useContext(LinkContext);
    const [bookmarkedLinks, setBookmarkedLinks] = useState([]);
    const [bookmarkCounts, setBookmarkCounts] = useState({});
    const [name, setName] = useState("");
    const [image, setImage] = useState({ url: "", public_id: "" });
    const [state] = useContext(AuthContext);

    useEffect(() => {
        if (state && state.user) {
            const { name, image } = state.user;
            setName(name);
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

    const handlePress = async (link) => {
        await axios.put(`http://localhost:8000/api/view-count/${link._id}`);
        navigation.navigate("LinkView", { link });
        setLinks(links.map(l => l._id === link._id ? { ...l, views: l.views + 1 } : l));
    };

    const handleBookmark = (link) => {
        const linkId = link._id;
        const isBookmarked = bookmarkedLinks.includes(linkId);
        if (isBookmarked) {
            setBookmarkedLinks(bookmarkedLinks.filter(id => id !== linkId));
            setBookmarkCounts({ ...bookmarkCounts, [linkId]: bookmarkCounts[linkId] - 1 });
        } else {
            setBookmarkedLinks([...bookmarkedLinks, linkId]);
            setBookmarkCounts({ ...bookmarkCounts, [linkId]: (bookmarkCounts[linkId] || 0) + 1 });
        }
    };

    const nailsets = [
        require('../assets/nail-sets/nails1.png'),
        require('../assets/nail-sets/nails2.png'),
        require('../assets/nail-sets/nails3.png'),
        require('../assets/nail-sets/nails4.png'),
        require('../assets/nail-sets/nails5.png'),
        require('../assets/nail-sets/nails6.png'),
    ];

    const onShare = async (image) => {
        try {
            await Share.share({ message: 'Check out these nails! 💅' });
        } catch (error) {
            Alert.alert(error.message);
        }
    };

    if (!fontsLoaded) return <AppLoading />;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>✦ explore</Text>
                    <Text style={styles.headerSub}>nail inspirations</Text>
                </View>
                {image && image.url ? (
                    <TouchableOpacity onPress={() => navigation.navigate("Account")}>
                        <Image source={{ uri: image.url }} style={styles.avatar} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={() => navigation.navigate("Account")} style={styles.avatarPlaceholder}>
                        <FontAwesome5 name="user" size={18} color={theme.colors.hot_pink} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Quick action banner */}
            <TouchableOpacity style={styles.tryOnBanner} onPress={() => navigation.navigate("SeeNails")}>
                <FontAwesome5 name="hand-sparkles" solid size={18} color={theme.colors.hot_pink} />
                <Text style={styles.tryOnText}>  Try nails on your hand →</Text>
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {links && links.map((item, index) => (
                    <View key={item._id} style={styles.card}>
                        <TouchableOpacity onPress={() => handlePress(item)} activeOpacity={0.9}>
                            <Image
                                style={styles.cardImage}
                                source={nailsets[index % nailsets.length]}
                            />
                            {/* Pink glow overlay at bottom */}
                            <View style={styles.cardOverlay} />
                        </TouchableOpacity>

                        <View style={styles.cardFooter}>
                            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                            <View style={styles.cardActions}>
                                <Text style={styles.viewCount}>
                                    <FontAwesome5 name="eye" size={12} color={theme.colors.text_secondary} />
                                    {"  "}{bookmarkedLinks.includes(item._id)
                                        ? (bookmarkCounts[item._id] || 0) + item.views
                                        : item.views}
                                </Text>
                                <TouchableOpacity onPress={() => handleBookmark(item)} style={styles.actionBtn}>
                                    <FontAwesome5
                                        name="bookmark"
                                        solid={bookmarkedLinks.includes(item._id)}
                                        size={16}
                                        color={bookmarkedLinks.includes(item._id) ? theme.colors.hot_pink : theme.colors.text_secondary}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => onShare()} style={styles.actionBtn}>
                                    <FontAwesome5 name="share-square" solid size={16} color={theme.colors.text_secondary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}

                {/* Fallback cards when no API data */}
                {(!links || links.length === 0) && nailsets.map((nail, index) => (
                    <View key={index} style={styles.card}>
                        <Image style={styles.cardImage} source={nail} />
                        <View style={styles.cardOverlay} />
                        <View style={styles.cardFooter}>
                            <Text style={styles.cardTitle}>Nail Design #{index + 1}</Text>
                            <View style={styles.cardActions}>
                                <TouchableOpacity style={styles.actionBtn}>
                                    <FontAwesome5 name="bookmark" size={16} color={theme.colors.text_secondary} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionBtn}>
                                    <FontAwesome5 name="share-square" solid size={16} color={theme.colors.text_secondary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}

                <View style={{ height: 120 }} />
            </ScrollView>
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
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: 30,
        fontFamily: 'SourceSerifPro_900Black',
        color: theme.colors.hot_pink,
        letterSpacing: 1,
    },
    headerSub: {
        fontSize: 13,
        fontFamily: 'SourceSansPro_300Light',
        color: theme.colors.text_secondary,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginTop: 2,
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 2,
        borderColor: theme.colors.hot_pink,
    },
    avatarPlaceholder: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 2,
        borderColor: theme.colors.hot_pink,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
    },
    tryOnBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 24,
        marginBottom: 16,
        paddingVertical: 12,
        paddingHorizontal: 18,
        backgroundColor: theme.colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.colors.pink_border,
    },
    tryOnText: {
        color: theme.colors.soft_pink,
        fontFamily: 'SourceSansPro_600SemiBold',
        fontSize: 14,
        letterSpacing: 0.3,
    },
    scrollContent: {
        paddingHorizontal: 24,
    },
    card: {
        backgroundColor: theme.colors.card_bg,
        borderRadius: 20,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.pink_border,
        shadowColor: theme.colors.hot_pink,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
    },
    cardImage: {
        width: '100%',
        height: 220,
        resizeMode: 'cover',
    },
    cardOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: 'transparent',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    cardTitle: {
        flex: 1,
        fontSize: 15,
        fontFamily: 'SourceSansPro_600SemiBold',
        color: theme.colors.text_primary,
        marginRight: 8,
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    viewCount: {
        fontSize: 12,
        color: theme.colors.text_secondary,
        fontFamily: 'SourceSansPro_400Regular',
        marginRight: 4,
    },
    actionBtn: {
        padding: 4,
    },
});

export default Home;
