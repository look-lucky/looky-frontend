import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

const PostcodeModal = ({ visible, onClose, onSelected }) => {
    const postcodeHtml = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no">
        <style>
            html, body { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; background: #fff; }
            #layer { position:fixed; display:block; background:#fff; width:100%; height:100%; -webkit-overflow-scrolling:touch; z-index:1; }
        </style>
    </head>
    <body>
        <div id="layer"></div>
        <script src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
        <script>
            var element_layer = document.getElementById('layer');

            function startPostcode() {
                new daum.Postcode({
                    oncomplete: function(data) {
                        var json = JSON.stringify(data);
                        if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(json);
                        }
                        // Backup bridge
                        window.location.href = "postcode://data=" + encodeURIComponent(json);
                    },
                    width : '100%',
                    height : '100%',
                    maxSuggestItems : 5
                }).embed(element_layer);
            }

            if (typeof daum !== 'undefined') {
                startPostcode();
            } else {
                window.onload = startPostcode;
            }
        </script>
    </body>
    </html>
  `;

    const handleMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            console.log("📍 [PostcodeModal] received Data:", data);

            if (data.type === 'DEBUG_ERROR') {
                console.warn("📍 [PostcodeModal] WEBVIEW ERROR:", data.message);
                return;
            }

            if (data && onSelected) {
                onSelected(data);
            }
        } catch (error) {
            console.error("📍 [PostcodeModal] parsing error:", error);
        }
    };

    const handleShouldStartLoadWithRequest = (request) => {
        if (request.url.startsWith('postcode://')) {
            try {
                const jsonString = decodeURIComponent(request.url.replace('postcode://data=', ''));
                const data = JSON.parse(jsonString);
                if (data && onSelected) {
                    onSelected(data);
                }
            } catch (error) {
                console.error("📍 [PostcodeModal] URL parsing error:", error);
            }
            return false;
        }
        return true;
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <SafeAreaView style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>우편번호 찾기</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                        >
                            <Ionicons name="close" size={rs(24)} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <WebView
                        source={{ html: postcodeHtml, baseUrl: 'https://daum.net' }}
                        onMessage={handleMessage}
                        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        mixedContentMode="always"
                        originWhitelist={['*']}
                        scalesPageToFit={true}
                        style={{ flex: 1 }}
                    />
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        height: rs(50),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: rs(20),
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    headerTitle: {
        fontSize: rs(16),
        fontWeight: '700',
        color: '#333',
        fontFamily: 'Pretendard',
    },
});

export default PostcodeModal;
