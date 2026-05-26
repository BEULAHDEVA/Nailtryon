import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { useNavigation, useRoute } from "@react-navigation/native";
import theme from "../../styles/theme.style";

const FooterList = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const tabs = [
        { name: "globe-asia", label: "explore", screen: "Home" },
        { name: "hand-sparkles", label: "try on", screen: "SeeNails" },
        { name: "user", label: "profile", screen: "Account" },
    ];

    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                {tabs.map((tab) => {
                    const isActive = route.name === tab.screen;
                    return (
                        <TouchableOpacity
                            key={tab.screen}
                            onPress={() => navigation.navigate(tab.screen)}
                            style={styles.tab}
                        >
                            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                                <FontAwesome5
                                    name={tab.name}
                                    solid
                                    size={20}
                                    color={isActive ? theme.colors.hot_pink : theme.colors.text_secondary}
                                />
                            </View>
                            <Text style={[styles.label, isActive && styles.labelActive]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: 'transparent',
    },
    container: {
        flexDirection: "row",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        justifyContent: "space-around",
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.pink_border,
        shadowColor: theme.colors.hot_pink,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
    },
    tab: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    iconWrap: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    iconWrapActive: {
        backgroundColor: theme.colors.pink_glow,
        borderWidth: 1,
        borderColor: theme.colors.hot_pink,
        shadowColor: theme.colors.hot_pink,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
    },
    label: {
        fontSize: 11,
        marginTop: 2,
        color: theme.colors.text_secondary,
        fontFamily: 'SourceSansPro_400Regular',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    labelActive: {
        color: theme.colors.hot_pink,
        fontFamily: 'SourceSansPro_600SemiBold',
    },
});

export default FooterList;
