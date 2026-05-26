import { StyleSheet, Text, SafeAreaView, ScrollView, View, Image, TouchableOpacity } from "react-native";
import React, { useContext, useEffect } from "react";
import FooterList from "../components/footer/FooterList";
import axios from "axios";
import { LinkContext } from "../context/link";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import theme from "../styles/theme.style";

const Links = ({ navigation }) => {
    const [links, setLinks] = useContext(LinkContext);

    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = async () => {
        try {
            const { data } = await axios.get("http://localhost:8000/api/links");
            setLinks(data);
        } catch (e) { }
    };

    const handlePress = async link => {
        await axios.put(`http://localhost:8000/api/view-count/${link._id}`);
        navigation.navigate("LinkView", { link });
        setLinks(links.map(l => l._id === link._id ? { ...l, views: l.views + 1 } : l));
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.mainText}>✦ trending</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                {links && links.sort((a, b) => (a.views < b.views ? 1 : -1)).slice(0, 3).map(item => (
                    <View key={item._id} style={styles.box}>
                        <Image style={styles.boxImage}
                            source={{ uri: 'https://placeimg.com/500/500/tech' }} />
                        <View style={{ position: "absolute", top: 16, right: 16 }}>
                            <FontAwesome5 name="eye" size={18} color={theme.colors.hot_pink} />
                            <Text style={styles.viewText}>{item.views}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handlePress(item)}>
                            <View style={{ padding: 12 }}>
                                <Text style={styles.boxText}>{item.title}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                ))}
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
    mainText: {
        fontSize: 28,
        fontFamily: 'SourceSerifPro_900Black',
        color: theme.colors.hot_pink,
        marginLeft: 24,
        marginVertical: 16,
        letterSpacing: 1,
    },
    viewText: {
        color: theme.colors.hot_pink,
        fontSize: 16,
        textAlign: "center",
        fontFamily: 'SourceSansPro_400Regular',
    },
    box: {
        width: 300,
        backgroundColor: theme.colors.card_bg,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.pink_border,
        marginRight: 16,
        overflow: 'hidden',
    },
    boxImage: {
        width: "100%",
        height: 200,
    },
    boxText: {
        fontSize: 16,
        fontFamily: 'SourceSansPro_600SemiBold',
        color: theme.colors.text_primary,
    },
});

export default Links;
