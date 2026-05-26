import AppLoading from 'expo-app-loading';
import {
    useFonts as expoUseFonts,
    SourceSerifPro_200ExtraLight,
    SourceSerifPro_200ExtraLight_Italic,
    SourceSerifPro_300Light,
    SourceSerifPro_300Light_Italic,
    SourceSerifPro_400Regular,
    SourceSerifPro_400Regular_Italic,
    SourceSerifPro_600SemiBold,
    SourceSerifPro_600SemiBold_Italic,
    SourceSerifPro_700Bold,
    SourceSerifPro_700Bold_Italic,
    SourceSerifPro_900Black,
    SourceSerifPro_900Black_Italic,
} from '@expo-google-fonts/source-serif-pro';
import {
    // useFonts as expoUseFont,
    SourceSansPro_200ExtraLight,
    SourceSansPro_200ExtraLight_Italic,
    SourceSansPro_300Light,
    SourceSansPro_300Light_Italic,
    SourceSansPro_400Regular,
    SourceSansPro_400Regular_Italic,
    SourceSansPro_600SemiBold,
    SourceSansPro_600SemiBold_Italic,
    SourceSansPro_700Bold,
    SourceSansPro_700Bold_Italic,
    SourceSansPro_900Black,
    SourceSansPro_900Black_Italic,
} from '@expo-google-fonts/source-sans-pro';

export const useFonts = () => {
    return expoUseFonts({
        SourceSerifPro_200ExtraLight,
        SourceSerifPro_200ExtraLight_Italic,
        SourceSerifPro_300Light,
        SourceSerifPro_300Light_Italic,
        SourceSerifPro_400Regular,
        SourceSerifPro_400Regular_Italic,
        SourceSerifPro_600SemiBold,
        SourceSerifPro_600SemiBold_Italic,
        SourceSerifPro_700Bold,
        SourceSerifPro_700Bold_Italic,
        SourceSerifPro_900Black,
        SourceSerifPro_900Black_Italic,
        SourceSansPro_200ExtraLight,
        SourceSansPro_200ExtraLight_Italic,
        SourceSansPro_300Light,
        SourceSansPro_300Light_Italic,
        SourceSansPro_400Regular,
        SourceSansPro_400Regular_Italic,
        SourceSansPro_600SemiBold,
        SourceSansPro_600SemiBold_Italic,
        SourceSansPro_700Bold,
        SourceSansPro_700Bold_Italic,
        SourceSansPro_900Black,
        SourceSansPro_900Black_Italic,
    });
};

export const colors = {
    // Futuristic Pink Theme
    primary_bg: '#0D0D1A',          // deep dark background
    surface: '#1A1A2E',             // card/surface background
    surface_light: '#16213E',       // slightly lighter surface
    hot_pink: '#FF2D78',            // primary accent - hot pink
    neon_pink: '#FF6EB4',           // secondary accent - neon pink
    soft_pink: '#FFB3D1',           // soft pink for text
    magenta: '#C2185B',             // deep magenta
    pink_glow: '#FF2D7833',         // pink with opacity for glow effects
    pink_border: '#FF2D7866',       // pink border
    white: '#FFFFFF',
    off_white: '#F8E8EE',
    text_primary: '#FFE4F0',        // primary text on dark bg
    text_secondary: '#C084A8',      // secondary text
    card_bg: '#1E1E35',             // card background
    overlay: 'rgba(13,13,26,0.85)', // dark overlay

    // Legacy aliases (keep for compatibility)
    primary_white: '#0D0D1A',
    light_blue: '#FF6EB4',
    dark_blue: '#FF2D78',
    pinky: '#FF2D78',
    yellow_mellow: '#FFB3D1',
    gray_gal: '#1E1E35',
    post_background: '#1A1A2E',
};

export const fonts = {
    ss_extra_light: 'SourceSerifPro_200ExtraLight',
    ss_extra_light_italic: 'SourceSerifPro_200ExtraLight_Italic',
    ss_light: 'SourceSerifPro_300Light',
    ss_light_italic: 'SourceSerifPro_300Light_Italic',
    ss_regular: 'SourceSerifPro_400Regular',
    ss_regular_italic: 'SourceSerifPro_400Regular_Italic',
    ss_semibold: 'SourceSerifPro_600SemiBold',
    ss_semibold_italic: 'SourceSerifPro_600SemiBold_Italic',
    ss_bold: 'SourceSerifPro_700Bold',
    ss_bold_italic: 'SourceSerifPro_700Bold_Italic',
    ss_black: 'SourceSerifPro_900Black',
    ss_black_italic: 'SourceSerifPro_900Black_Italic',

    sc_extra_light: 'SourceSansPro_200ExtraLight',
    sc_light: 'SourceSansPro_300Light',
    sc_regular: 'SourceSansPro_400Regular',
    sc_semibold: 'SourceSansPro_600SemiBold',
    sc_bold: 'SourceSansPro_700Bold',
    sc_black: 'SourceSansPro_900Black',
    sc_extra_light_italic: 'SourceSansPro_200ExtraLight_Italic',
    sc_light_italic: 'SourceSansPro_300Light_Italic',
    sc_regular_italic: 'SourceSansPro_400Regular_Italic',
    sc_semibold_italic: 'SourceSansPro_600SemiBold_Italic',
    sc_bold_italic: 'SourceSansPro_700Bold_Italic',
    sc_black_italic: 'SourceSansPro_900Black_Italic',


};

export default {
    useFonts,
    colors,
    fonts,
}
