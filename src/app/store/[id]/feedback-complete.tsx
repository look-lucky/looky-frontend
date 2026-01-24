import { StoreIcons } from "@/assets/images/icons/store";
import { ArrowLeft } from "@/src/components/button/arrow-left";
import { AppButton } from "@/src/components/common/app-button";
import { ThemedText } from "@/src/components/themed-text";
import { rs } from "@/src/theme/scale";

import { useLocalSearchParams, useRouter } from "expo-router";
import {
    StyleSheet, View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StoreFeedbackCompleteScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    return (
        <SafeAreaView style={[styles.container]}>
            <View style={[styles.header]}>
                <ArrowLeft onPress={() => router.replace(`/store/${id}`)} />       
            </View>
            <View style={[styles.content]}>
                <StoreIcons.paperPlane />
                <ThemedText type="subtitle" lightColor="#111111" darkColor="#dddddd">
                    피드백이 접수되었어요
                </ThemedText>
                <ThemedText type="default" lightColor="#828282"> 
                    빠르게 확인하고 적용할게요
                </ThemedText>

            </View>
            <View>
                <AppButton 
                    label="홈으로 돌아가기" 
                    backgroundColor="#111111" 
                    onPress={() => {
                        router.replace(`/store/${id}`);
                    }} 
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
    },
    header: {
        paddingVertical: 12,
        alignItems: 'flex-start',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: rs(4),
    },
})