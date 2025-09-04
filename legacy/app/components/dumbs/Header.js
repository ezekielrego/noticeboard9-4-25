import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Constants from "expo-constants";

const HEADER_HEIGHT = 52 + Constants.statusBarHeight;

export default function Header({ backgroundColor = "#ff4d4f", textSearch = "Search" }) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.headerIcon} />
      <View style={[styles.formItem, { width: "70%" }]}>
        <Text style={styles.search}>{textSearch}</Text>
      </View>
      <View style={styles.headerIcon} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    height: HEADER_HEIGHT,
    paddingTop: Constants.statusBarHeight,
    width: "100%",
  },
  formItem: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 16,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  search: {
    color: "#fff",
    fontSize: 14,
  },
  headerIcon: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
