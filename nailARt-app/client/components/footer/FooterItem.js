import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import React from "react";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import theme from "../../styles/theme.style";

const FooterItem = ({ name, text, handlePress, screenName, routeName }) => {
    const isActive = screenName === routeName;

    return (
        <TouchableOpacity onPress={handlePress} style={styles.tab}>
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                <FontAwesome5
                    name={name}
                    solid
                    size={20}
                    color={isActive ? theme.colors.hot_pink : theme.colors.text_secondary}
                />
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{text}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    tab: {
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    iconWrap: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconWrapActive: {
        backgroundColor: theme.colors.pink_glow,
        borderWidth: 1,
        borderColor: theme.colors.hot_pink,
    },
    label: {
        fontSize: 10,
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

export default FooterItem;
