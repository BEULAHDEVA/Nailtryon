import { StatusBar } from 'expo-status-bar';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
    ScrollView, Dimensions, Image, Alert, PanResponder,
    Animated, ActivityIndicator,
} from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FooterList from '../components/footer/FooterList';
import theme from '../styles/theme.style';
import AppLoading from 'expo-app-loading';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs();

const { width: SW, height: SH } = Dimensions.get('window');

// ─── Colour aliases ─────────────────────────────────────────────────────────
const C = theme.colors;

// ─── Nail catalogue ─────────────────────────────────────────────────────────
const NAILS = [
    { src: require('../assets/single-nails/nail1.png'),  label: 'Glitter', color: '#FF6EB4' },
    { src: require('../assets/single-nails/nail2.png'),  label: 'French',  color: '#FFB3D1' },
    { src: require('../assets/single-nails/nail3.png'),  label: 'Marble',  color: '#C084A8' },
    { src: require('../assets/single-nails/nail4.png'),  label: 'Ombre',   color: '#FF2D78' },
    { src: require('../assets/single-nails/nail5.png'),  label: 'Floral',  color: '#FF6EB4' },
    { src: require('../assets/single-nails/nail6.png'),  label: 'Chrome',  color: '#C2185B' },
    { src: require('../assets/single-nails/nail7.png'),  label: 'Matte',   color: '#FFB3D1' },
    { src: require('../assets/single-nails/nail8.png'),  label: 'Gems',    color: '#FF2D78' },
    { src: require('../assets/single-nails/nail9.png'),  label: 'Art',     color: '#FF6EB4' },
    { src: require('../assets/single-nails/nail10.png'), label: 'Pastel',  color: '#C084A8' },
    { src: require('../assets/single-nails/nail11.png'), label: 'Bold',    color: '#C2185B' },
];

// ─── Finger slot definitions (relative to a 375-wide phone) ─────────────────
//     Positions sit in the UPPER half of the screen where fingers appear
const FINGER_SLOTS = [
    { id: 'thumb',  label: '👍',  relX: 0.13, relY: 0.42 },
    { id: 'index',  label: '☝️', relX: 0.30, relY: 0.25 },
    { id: 'middle', label: '🖕',  relX: 0.46, relY: 0.18 },
    { id: 'ring',   label: '💍',  relX: 0.62, relY: 0.22 },
    { id: 'pinky',  label: '🤙',  relX: 0.77, relY: 0.30 },
];

// ─── Single draggable nail sticker ──────────────────────────────────────────
const DraggableNail = ({ source, initX, initY, size, accentColor, onRemove }) => {
    const pan = useRef(new Animated.ValueXY({ x: initX, y: initY })).current;
    const scale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 80 }).start();
    }, []);

    const responder = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder:  () => true,
        onPanResponderGrant: () => {
            pan.setOffset({ x: pan.x._value, y: pan.y._value });
            pan.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
        onPanResponderRelease: () => pan.flattenOffset(),
    })).current;

    return (
        <Animated.View
            style={[
                styles.draggableNail,
                {
                    width: size,
                    height: size * 1.5,
                    transform: [...pan.getTranslateTransform(), { scale }],
                },
            ]}
            {...responder.panHandlers}
        >
            {/* Glow ring */}
            <View style={[styles.nailGlow, { borderColor: accentColor || C.hot_pink, shadowColor: accentColor || C.hot_pink }]} />
            <Image source={source} style={styles.draggableNailImg} />
            <TouchableOpacity style={[styles.removeBtn, { backgroundColor: accentColor || C.hot_pink }]} onPress={onRemove}>
                <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ─── Finger placement target dot ────────────────────────────────────────────
const FingerTarget = ({ slot, isReady, onPress }) => {
    const pulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isReady) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulse, { toValue: 1.25, duration: 600, useNativeDriver: true }),
                    Animated.timing(pulse, { toValue: 1,    duration: 600, useNativeDriver: true }),
                ])
            ).start();
        } else {
            pulse.setValue(1);
        }
    }, [isReady]);

    return (
        <Animated.View
            style={[
                styles.fingerTarget,
                {
                    left: SW * slot.relX - 22,
                    top:  SH * slot.relY - 22,
                    transform: [{ scale: pulse }],
                },
                isReady && styles.fingerTargetReady,
            ]}
        >
            <TouchableOpacity style={styles.fingerTargetInner} onPress={onPress} activeOpacity={0.7}>
                <Text style={styles.fingerTargetEmoji}>{slot.label}</Text>
                <Text style={styles.fingerTargetLabel}>{slot.id}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ─── Main screen ─────────────────────────────────────────────────────────────
const SeeNails = ({ navigation }) => {
    const [fontsLoaded] = theme.useFonts();

    // Camera permissions via Camera.useCameraPermissions (expo-camera v13 static hook)
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const [facing, setFacing] = useState(CameraType.back);
    const [flash, setFlash] = useState(FlashMode.off);
    const cameraRef = useRef(null);

    // Try-on state
    const [selectedNail, setSelectedNail] = useState(null);
    const [overlays, setOverlays] = useState([]);
    const [overlaySize, setOverlaySize] = useState(60);

    // Preview
    const [previewVisible, setPreviewVisible] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [capturing, setCapturing] = useState(false);

    // UI helpers
    const [showGuide, setShowGuide] = useState(true);

    useEffect(() => {
        if (showGuide) {
            const t = setTimeout(() => setShowGuide(false), 3500);
            return () => clearTimeout(t);
        }
    }, [showGuide]);

    // ── Actions ──────────────────────────────────────────────────────────────
    const placeFinger = useCallback((slot) => {
        if (selectedNail === null) {
            Alert.alert('💅 Pick a style first!', 'Select a nail design from the carousel below, then tap a finger.');
            return;
        }
        const x = SW * slot.relX - overlaySize / 2;
        const y = SH * slot.relY - overlaySize * 0.75;
        setOverlays(prev => [...prev, {
            id:    Date.now() + Math.random(),
            src:   NAILS[selectedNail].src,
            color: NAILS[selectedNail].color,
            x, y,
        }]);
    }, [selectedNail, overlaySize]);

    const removeOverlay = id => setOverlays(prev => prev.filter(o => o.id !== id));
    const clearAll      = ()  => setOverlays([]);

    const takePicture = async () => {
        if (!cameraRef.current || capturing) return;
        try {
            setCapturing(true);
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
            setCapturedImage(photo);
            setPreviewVisible(true);
        } catch (e) {
            Alert.alert('Oops', 'Could not capture photo. Please try again.');
        } finally {
            setCapturing(false);
        }
    };

    const savePhoto = async () => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Allow access to save photos.');
                return;
            }
            await MediaLibrary.saveToLibraryAsync(capturedImage.uri);
            Alert.alert('💅 Saved!', 'Your nail look has been saved to your camera roll.');
        } catch {
            Alert.alert('Error', 'Failed to save photo.');
        }
    };

    // ── Font guard ────────────────────────────────────────────────────────────
    if (!fontsLoaded) return <AppLoading />;

    // ── Permission screens ────────────────────────────────────────────────────
    if (!permission) {
        return (
            <View style={styles.permScreen}>
                <ActivityIndicator color={C.hot_pink} size="large" />
                <Text style={styles.permText}>Checking camera…</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.permScreen}>
                <StatusBar style="light" />
                <View style={styles.permCard}>
                    <Text style={styles.permIcon}>📸</Text>
                    <Text style={styles.permTitle}>Camera Access</Text>
                    <Text style={styles.permBody}>
                        We need your camera to overlay nail designs on your hand in real-time. No footage is stored.
                    </Text>
                    <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
                        <Text style={styles.permBtnText}>Allow Camera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
                        <Text style={styles.permSkip}>Go back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // ── Photo preview ─────────────────────────────────────────────────────────
    if (previewVisible && capturedImage) {
        return (
            <View style={styles.container}>
                <StatusBar style="light" />
                <SafeAreaView style={styles.previewHeader}>
                    <TouchableOpacity onPress={() => setPreviewVisible(false)} style={styles.backBtn}>
                        <FontAwesome5 name="arrow-left" size={16} color={C.hot_pink} />
                    </TouchableOpacity>
                    <Text style={styles.screenTitle}>✦ your look</Text>
                    <View style={{ width: 40 }} />
                </SafeAreaView>

                <View style={styles.photoFrame}>
                    <Image source={{ uri: capturedImage.uri }} style={styles.capturedPhoto} resizeMode="cover" />
                    {/* Corner decorators */}
                    {[styles.cornerTL, styles.cornerTR, styles.cornerBL, styles.cornerBR].map((cs, i) => (
                        <View key={i} style={[styles.corner, cs]} />
                    ))}
                </View>

                <View style={styles.previewActions}>
                    <TouchableOpacity style={styles.previewBtn} onPress={() => setPreviewVisible(false)}>
                        <FontAwesome5 name="redo" size={20} color={C.hot_pink} />
                        <Text style={styles.previewBtnLabel}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.previewBtn, styles.previewBtnPrimary]} onPress={savePhoto}>
                        <FontAwesome5 name="download" size={20} color="#fff" />
                        <Text style={[styles.previewBtnLabel, { color: '#fff' }]}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.previewBtn} onPress={() => navigation.navigate('Design')}>
                        <FontAwesome5 name="palette" size={20} color={C.hot_pink} />
                        <Text style={styles.previewBtnLabel}>Design</Text>
                    </TouchableOpacity>
                </View>
                <FooterList />
            </View>
        );
    }

    // ── Main try-on UI ────────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* ─ Live camera ─────────────────────────────────────────────── */}
            <Camera
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                type={facing}
                flashMode={flash}
            />

            {/* ─ Finger target dots ────────────────────────────────────────── */}
            {FINGER_SLOTS.map(slot => (
                <FingerTarget
                    key={slot.id}
                    slot={slot}
                    isReady={selectedNail !== null}
                    onPress={() => placeFinger(slot)}
                />
            ))}

            {/* ─ Draggable nail stickers ───────────────────────────────────── */}
            {overlays.map(o => (
                <DraggableNail
                    key={o.id}
                    source={o.src}
                    initX={o.x}
                    initY={o.y}
                    size={overlaySize}
                    accentColor={o.color}
                    onRemove={() => removeOverlay(o.id)}
                />
            ))}

            {/* ─ Top bar ─────────────────────────────────────────────────── */}
            <SafeAreaView style={styles.topBar} pointerEvents="box-none">
                <View style={styles.topRow}>
                    <View>
                        <Text style={styles.screenTitle}>✦ try on</Text>
                        <Text style={styles.screenSub}>
                            {selectedNail !== null
                                ? `${NAILS[selectedNail].label} · tap a finger dot`
                                : 'pick a design below'}
                        </Text>
                    </View>
                    <View style={styles.topControls}>
                        {/* Flip camera */}
                        <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() => setFacing(f =>
                                f === CameraType.back ? CameraType.front : CameraType.back
                            )}
                        >
                            <FontAwesome5 name="sync-alt" size={15} color={C.soft_pink} />
                        </TouchableOpacity>
                        {/* Flash toggle */}
                        <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() => setFlash(f =>
                                f === FlashMode.off ? FlashMode.on : FlashMode.off
                            )}
                        >
                            <FontAwesome5
                                name="bolt"
                                size={15}
                                color={flash === FlashMode.on ? '#FFD700' : C.soft_pink}
                            />
                        </TouchableOpacity>
                        {/* Clear all */}
                        {overlays.length > 0 && (
                            <TouchableOpacity style={[styles.iconBtn, styles.clearBtn]} onPress={clearAll}>
                                <Text style={styles.clearBtnText}>Clear</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </SafeAreaView>

            {/* ─ Guided tip banner ─────────────────────────────────────────── */}
            {showGuide && (
                <View style={styles.guideBanner}>
                    <Text style={styles.guideText}>
                        👇 Pick a nail design · tap the glowing dots to place on fingers · drag to adjust
                    </Text>
                </View>
            )}

            {/* ─ Size adjuster (appears once nails are placed) ──────────────── */}
            {overlays.length > 0 && (
                <View style={styles.sizeControl}>
                    <FontAwesome5 name="ruler" size={11} color={C.soft_pink} />
                    <TouchableOpacity style={styles.sizeBtn} onPress={() => setOverlaySize(s => Math.max(35, s - 6))}>
                        <Text style={styles.sizeBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.sizeVal}>{overlaySize}</Text>
                    <TouchableOpacity style={styles.sizeBtn} onPress={() => setOverlaySize(s => Math.min(130, s + 6))}>
                        <Text style={styles.sizeBtnText}>+</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* ─ Bottom panel ──────────────────────────────────────────────── */}
            <View style={styles.bottomPanel}>

                {/* Step badge */}
                <View style={styles.stepBadge}>
                    <View style={[styles.stepDot, selectedNail !== null && styles.stepDotActive]} />
                    <View style={[styles.stepDot, overlays.length > 0  && styles.stepDotActive]} />
                    <Text style={styles.stepLabel}>
                        {selectedNail === null
                            ? '① Select a nail design'
                            : overlays.length === 0
                                ? '② Tap a finger dot to place'
                                : '③ Drag · resize · snap 📸'}
                    </Text>
                </View>

                {/* Nail carousel */}
                <ScrollView
                    horizontal
                    snapToInterval={76}
                    snapToAlignment="center"
                    decelerationRate="fast"
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.carouselContent}
                    style={styles.carousel}
                >
                    {NAILS.map((nail, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[
                                styles.nailCard,
                                selectedNail === i && { borderColor: nail.color, shadowColor: nail.color },
                            ]}
                            onPress={() => setSelectedNail(i)}
                            activeOpacity={0.8}
                        >
                            <Image source={nail.src} style={styles.nailCardImg} />
                            {selectedNail === i && (
                                <View style={[styles.nailCheckBadge, { backgroundColor: nail.color }]}>
                                    <FontAwesome5 name="check" size={7} color="#fff" />
                                </View>
                            )}
                            <Text style={styles.nailCardLabel} numberOfLines={1}>{nail.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Shutter row */}
                <View style={styles.shutterRow}>
                    <TouchableOpacity style={styles.sideAction} onPress={() => navigation.navigate('Design')}>
                        <View style={styles.sideIconWrap}>
                            <FontAwesome5 name="palette" size={18} color={C.neon_pink} />
                        </View>
                        <Text style={styles.sideActionText}>Design</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.shutter} onPress={takePicture} disabled={capturing} activeOpacity={0.8}>
                        {capturing
                            ? <ActivityIndicator color="#fff" />
                            : <View style={styles.shutterInner} />
                        }
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.sideAction} onPress={() => setShowGuide(true)}>
                        <View style={styles.sideIconWrap}>
                            <FontAwesome5 name="question-circle" size={18} color={C.neon_pink} />
                        </View>
                        <Text style={styles.sideActionText}>Guide</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FooterList />
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },

    // ─ Permission screens ─
    permScreen: {
        flex: 1,
        backgroundColor: C.primary_bg,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    permText: { color: C.soft_pink, marginTop: 16, fontFamily: 'SourceSansPro_300Light', fontSize: 14 },
    permCard: {
        width: '100%',
        backgroundColor: C.surface,
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: C.pink_border,
    },
    permIcon:  { fontSize: 48, marginBottom: 12 },
    permTitle: { fontSize: 22, fontFamily: 'SourceSerifPro_700Bold', color: C.hot_pink, marginBottom: 10 },
    permBody:  { fontSize: 14, fontFamily: 'SourceSansPro_300Light', color: C.soft_pink, textAlign: 'center', lineHeight: 22 },
    permBtn: {
        marginTop: 24,
        backgroundColor: C.hot_pink,
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 50,
        shadowColor: C.hot_pink,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        elevation: 10,
    },
    permBtnText: { color: '#fff', fontFamily: 'SourceSansPro_700Bold', fontSize: 15, letterSpacing: 0.5 },
    permSkip:    { color: C.text_secondary, fontFamily: 'SourceSansPro_400Regular', fontSize: 13 },

    // ─ Draggable nail sticker ─
    draggableNail: {
        position: 'absolute',
        zIndex: 20,
    },
    nailGlow: {
        position: 'absolute',
        inset: -3,
        borderRadius: 16,
        borderWidth: 2,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
    },
    draggableNailImg: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
        borderRadius: 12,
    },
    removeBtn: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 21,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5,
    },
    removeBtnText: { color: '#fff', fontSize: 10, fontWeight: '800', lineHeight: 12 },

    // ─ Finger targets ─
    fingerTarget: {
        position: 'absolute',
        width: 44,
        height: 44,
        zIndex: 10,
    },
    fingerTargetReady: {
        // pulse animation on the Animated.View, styled via inner
    },
    fingerTargetInner: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.30)',
        backgroundColor: 'rgba(13,13,26,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fingerTargetEmoji: { fontSize: 14, lineHeight: 16 },
    fingerTargetLabel: {
        fontSize: 7,
        color: 'rgba(255,255,255,0.70)',
        fontFamily: 'SourceSansPro_600SemiBold',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },

    // ─ Top bar ─
    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 15,
        backgroundColor: 'rgba(13,13,26,0.78)',
        paddingHorizontal: 18,
        paddingTop: 6,
        paddingBottom: 12,
    },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    screenTitle: {
        fontSize: 22,
        fontFamily: 'SourceSerifPro_900Black',
        color: C.hot_pink,
        letterSpacing: 1,
        marginTop: 6,
    },
    screenSub: {
        fontSize: 11,
        fontFamily: 'SourceSansPro_300Light',
        color: C.soft_pink,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginTop: 2,
    },
    topControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.10)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
    },
    clearBtn: {
        width: 'auto',
        paddingHorizontal: 12,
        backgroundColor: 'rgba(255,45,120,0.22)',
        borderColor: C.pink_border,
    },
    clearBtnText: {
        fontSize: 11,
        color: C.hot_pink,
        fontFamily: 'SourceSansPro_600SemiBold',
        textTransform: 'uppercase',
    },

    // ─ Guide banner ─
    guideBanner: {
        position: 'absolute',
        top: '18%',
        left: 20,
        right: 20,
        backgroundColor: 'rgba(13,13,26,0.88)',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderWidth: 1,
        borderColor: C.pink_border,
        zIndex: 12,
        alignItems: 'center',
    },
    guideText: {
        color: C.soft_pink,
        fontFamily: 'SourceSansPro_400Regular',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
    },

    // ─ Size control ─
    sizeControl: {
        position: 'absolute',
        top: '28%',
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(13,13,26,0.82)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: C.pink_border,
        zIndex: 12,
    },
    sizeBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: C.surface,
        borderWidth: 1,
        borderColor: C.pink_border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sizeBtnText: { fontSize: 18, color: C.hot_pink, lineHeight: 22 },
    sizeVal: {
        fontSize: 13,
        color: C.soft_pink,
        fontFamily: 'SourceSansPro_600SemiBold',
        minWidth: 28,
        textAlign: 'center',
    },

    // ─ Bottom panel ─
    bottomPanel: {
        position: 'absolute',
        bottom: 74,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(13,13,26,0.93)',
        borderTopWidth: 1,
        borderTopColor: C.pink_border,
        paddingTop: 12,
        paddingBottom: 6,
        zIndex: 10,
    },

    // Step indicator
    stepBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 12,
        gap: 6,
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        borderColor: C.pink_border,
    },
    stepDotActive: {
        backgroundColor: C.hot_pink,
        borderColor: C.hot_pink,
        shadowColor: C.hot_pink,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 4,
    },
    stepLabel: {
        fontSize: 11,
        color: C.soft_pink,
        fontFamily: 'SourceSansPro_400Regular',
        letterSpacing: 0.3,
        flex: 1,
    },

    // Nail carousel
    carousel: { marginBottom: 12 },
    carouselContent: { paddingHorizontal: 16, gap: 10 },
    nailCard: {
        width: 62,
        alignItems: 'center',
        backgroundColor: C.surface,
        borderRadius: 16,
        paddingTop: 6,
        paddingBottom: 4,
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
    },
    nailCardImg: {
        width: 52,
        height: 80,
        borderRadius: 10,
        resizeMode: 'cover',
    },
    nailCheckBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.4,
        shadowRadius: 2,
    },
    nailCardLabel: {
        fontSize: 9,
        color: C.text_secondary,
        fontFamily: 'SourceSansPro_600SemiBold',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        marginTop: 4,
        textAlign: 'center',
    },

    // Shutter row
    shutterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 40,
        marginTop: 4,
    },
    shutter: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 3,
        borderColor: C.hot_pink,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: C.hot_pink,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 16,
        elevation: 10,
        backgroundColor: 'rgba(255,45,120,0.10)',
    },
    shutterInner: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: C.hot_pink,
        shadowColor: C.hot_pink,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
    },
    sideAction: { alignItems: 'center', width: 60 },
    sideIconWrap: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255,110,180,0.12)',
        borderWidth: 1,
        borderColor: C.pink_border,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    sideActionText: {
        fontSize: 10,
        color: C.text_secondary,
        fontFamily: 'SourceSansPro_400Regular',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },

    // ─ Photo preview ─
    previewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 8,
        backgroundColor: C.primary_bg,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: C.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: C.pink_border,
    },
    photoFrame: {
        flex: 1,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 28,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: C.pink_border,
    },
    capturedPhoto: { width: '100%', height: '100%' },
    corner: { position: 'absolute', width: 22, height: 22, borderColor: C.hot_pink },
    cornerTL: { top: 10, left: 10, borderTopWidth: 2.5, borderLeftWidth: 2.5,   borderTopLeftRadius: 6 },
    cornerTR: { top: 10, right: 10, borderTopWidth: 2.5, borderRightWidth: 2.5, borderTopRightRadius: 6 },
    cornerBL: { bottom: 10, left: 10, borderBottomWidth: 2.5, borderLeftWidth: 2.5,   borderBottomLeftRadius: 6 },
    cornerBR: { bottom: 10, right: 10, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderBottomRightRadius: 6 },
    previewActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 18,
        paddingHorizontal: 20,
        marginBottom: 80,
        backgroundColor: C.primary_bg,
    },
    previewBtn: {
        alignItems: 'center',
        backgroundColor: C.surface,
        paddingVertical: 14,
        paddingHorizontal: 22,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: C.pink_border,
        gap: 8,
    },
    previewBtnPrimary: {
        backgroundColor: C.hot_pink,
        borderColor: C.hot_pink,
        shadowColor: C.hot_pink,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        elevation: 10,
    },
    previewBtnLabel: {
        fontSize: 12,
        color: C.soft_pink,
        fontFamily: 'SourceSansPro_600SemiBold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});

export default SeeNails;
