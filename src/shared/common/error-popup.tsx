import { rs } from '@/src/shared/theme/scale';
import { Fonts, Gray } from '@/src/shared/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Image,
    Modal,
    ModalProps,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export type ErrorType = 'NETWORK' | 'GPS';

interface ErrorPopupProps extends ModalProps {
    visible: boolean;
    type: ErrorType;
    isRefreshing?: boolean;
    onRefresh: () => void;
    onClose: () => void;
}

const ERROR_MAPPINGS = {
    NETWORK: {
        title: '인터넷에 연결되어 있지 않아요',
        subtitle: '연결 확인 후 다시 시도해주세요',
    },
    GPS: {
        title: 'GPS 신호를 찾고 있어요',
        subtitle: '문제가 계속되면 잠시 후 다시 시도해주세요',
    },
};

export function ErrorPopup({
    visible,
    type,
    isRefreshing = false,
    onRefresh,
    onClose,
    ...modalProps
}: ErrorPopupProps) {
    const content = ERROR_MAPPINGS[type];

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
            {...modalProps}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Close Button */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="close" size={rs(20)} color={Gray.gray9} />
                    </TouchableOpacity>

                    {/* Illustration */}
                    <Image
                        source={require('@/assets/images/shopowner/error2.png')}
                        style={styles.illustration}
                        resizeMode="contain"
                    />

                    {/* Texts */}
                    <View style={styles.textSection}>
                        <Text style={styles.title}>{content.title}</Text>
                        <Text style={styles.subtitle}>{content.subtitle}</Text>
                    </View>

                    {/* Refresh Button */}
                    <TouchableOpacity
                        style={[styles.refreshButton, isRefreshing && { opacity: 0.8 }]}
                        onPress={onRefresh}
                        disabled={isRefreshing}
                    >
                        {isRefreshing ? (
                            <ActivityIndicator color={Gray.white} size="small" />
                        ) : (
                            <Text style={styles.refreshText}>새로고침</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: rs(20),
    },
    container: {
        width: rs(335),
        backgroundColor: Gray.white,
        borderRadius: 10,
        paddingTop: rs(30),
        paddingBottom: rs(25),
        paddingHorizontal: rs(20),
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: Gray.black,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.25,
                shadowRadius: 30,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    closeButton: {
        position: 'absolute',
        top: rs(10),
        right: rs(15),
    },
    illustration: {
        width: rs(94),
        height: rs(94),
        marginBottom: rs(20),
    },
    textSection: {
        alignItems: 'center',
        marginBottom: rs(25),
    },
    title: {
        fontFamily: Fonts.bold,
        fontSize: rs(20),
        lineHeight: rs(28),
        color: Gray.black,
        textAlign: 'center',
        marginBottom: rs(5),
    },
    subtitle: {
        fontFamily: Fonts.medium,
        fontSize: rs(14),
        lineHeight: rs(19.6),
        color: Gray.gray9,
        textAlign: 'center',
    },
    refreshButton: {
        width: rs(300),
        height: rs(40),
        backgroundColor: Gray.black,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    refreshText: {
        fontFamily: Fonts.bold,
        fontSize: rs(14),
        color: Gray.white,
    },
});
