import { StyleSheet, Text, View, TextInput, TouchableOpacity } from "react-native";
import React, { useState, useContext } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../context/auth";
import theme from "../styles/theme.style";
import AppLoading from "expo-app-loading";

const SignUp = ({ navigation }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [state, setState] = useContext(AuthContext);
    let [fontsLoaded] = theme.useFonts();

    const handleSubmit = async () => {
        if (name === "" || email === "" || password === "") {
            alert("Please fill in all fields");
            return;
        }
        try {
            const resp = await axios.post("http://localhost:8000/api/signup", { name, email, password });
            if (resp.data.error) {
                alert(resp.data.error);
            } else {
                setState(resp.data);
                await AsyncStorage.setItem("auth-rn", JSON.stringify(resp.data));
                navigation.navigate("Home");
            }
        } catch (e) {
            alert("Something went wrong");
        }
    };

    if (!fontsLoaded) return <AppLoading />;

    return (
        <KeyboardAwareScrollView
            contentContainerStyle={styles.container}
            style={{ backgroundColor: theme.colors.primary_bg }}
        >
            <View style={styles.glowBlob} />

            <View style={styles.inner}>
                <Text style={styles.brand}>💅 nailAR</Text>
                <Text style={styles.title}>join us</Text>
                <Text style={styles.subtitle}>create your account</Text>

                <View style={styles.form}>
                    <Text style={styles.inputLabel}>NAME</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        autoCorrect={false}
                        placeholderTextColor={theme.colors.text_secondary}
                        placeholder="Your name"
                    />

                    <Text style={styles.inputLabel}>EMAIL</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor={theme.colors.text_secondary}
                        placeholder="your@email.com"
                    />

                    <Text style={styles.inputLabel}>PASSWORD</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor={theme.colors.text_secondary}
                        placeholder="••••••••"
                    />

                    <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit}>
                        <Text style={styles.primaryBtnText}>sign up</Text>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>already have an account?</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate("SignIn")}>
                        <Text style={styles.secondaryBtnText}>log in</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: theme.colors.primary_bg,
    },
    glowBlob: {
        position: 'absolute',
        top: -60,
        left: -80,
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: theme.colors.hot_pink,
        opacity: 0.1,
    },
    inner: {
        flex: 1,
        paddingHorizontal: 32,
        paddingTop: 90,
        paddingBottom: 60,
    },
    brand: {
        fontSize: 22,
        fontFamily: 'SourceSansPro_700Bold',
        color: theme.colors.hot_pink,
        marginBottom: 32,
        letterSpacing: 1,
    },
    title: {
        fontSize: 38,
        fontFamily: 'SourceSerifPro_900Black',
        color: theme.colors.text_primary,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'SourceSansPro_300Light',
        color: theme.colors.text_secondary,
        marginBottom: 36,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    form: {
        gap: 4,
    },
    inputLabel: {
        fontSize: 11,
        fontFamily: 'SourceSansPro_600SemiBold',
        color: theme.colors.hot_pink,
        letterSpacing: 2,
        marginBottom: 6,
        marginTop: 16,
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.pink_border,
        borderRadius: 12,
        height: 50,
        paddingHorizontal: 16,
        fontSize: 16,
        fontFamily: 'SourceSansPro_400Regular',
        color: theme.colors.text_primary,
    },
    primaryBtn: {
        backgroundColor: theme.colors.hot_pink,
        height: 54,
        borderRadius: 27,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 28,
        shadowColor: theme.colors.hot_pink,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
    },
    primaryBtnText: {
        fontSize: 18,
        fontFamily: 'SourceSansPro_700Bold',
        color: theme.colors.white,
        letterSpacing: 1,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
        gap: 8,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.pink_border,
    },
    dividerText: {
        fontSize: 11,
        color: theme.colors.text_secondary,
        fontFamily: 'SourceSansPro_400Regular',
    },
    secondaryBtn: {
        borderWidth: 1.5,
        borderColor: theme.colors.hot_pink,
        height: 54,
        borderRadius: 27,
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryBtnText: {
        fontSize: 18,
        fontFamily: 'SourceSansPro_700Bold',
        color: theme.colors.hot_pink,
        letterSpacing: 1,
    },
});

export default SignUp;
