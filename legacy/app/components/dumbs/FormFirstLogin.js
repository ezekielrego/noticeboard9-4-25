import React, { PureComponent } from "react";

import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  Dimensions,
  ScrollView,
  Text,
  Alert,
} from "react-native";
import Constants from "expo-constants";
import { isEqual } from "lodash";
import { StatusBar } from "expo-status-bar";

import logo from "../../../assets/screenlogo.png";
import background from "../../../assets/loginCover.png";
import {
  Button,
  H4,
  P,
  KeyboardAnimationRP,
  FontIcon,
  RTL,
  AlertError,
} from "../../wiloke-elements";
import {
  colorDark2,
  colorDark3,
  colorQuaternary,
  screenHeight,
} from "../../constants/styleConstants";
import MyAlert from "./MyAlert/MyAlert";

const IOS = Platform.OS === "ios";

class FormFirstLogin extends PureComponent {
  // static propTypes = {
  //   allowFontScaling: TextPropTypes.allowFontScaling,
  //   style: TextPropTypes.style,
  //   styleDisabled: TextPropTypes.style,
  //   onSkip: PropTypes.func,
  //   onNavigateRegister: PropTypes.func,
  //   onNavigateLostPassword: PropTypes.func,
  //   onClickGetOtp: PropTypes.func,
  //   renderBottom: PropTypes.func,
  //   onLogin: PropTypes.func.isRequired,
  //   isLoginLoading: PropTypes.bool,
  //   colorPrimary: PropTypes.string,
  //   translations: PropTypes.object,
  //   title: PropTypes.string,
  //   text: PropTypes.string,
  //   skipButtonText: PropTypes.string,
  //   loginError: PropTypes.string,
  // };

  static defaultProps = {
    onSkip: () => {},
    onNavigateRegister: () => {},
    onNavigateLostPassword: () => {},
    onClickGetOtp: () => {},
    onLogin: () => {},
    renderBottom: () => {},
    isLoginLoading: false,
    skipButtonText: "Skip",
  };

  state = {
    result: {
      username: "",
      password: "",
    },
    isLoginLoading: false,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEqual(nextProps.isLoginLoading, prevState.isLoginLoading)) {
      return {
        isLoginLoading: nextProps.isLoginLoading,
      };
    }
    return null;
  }

  _handleChangeUserName = (username) => {
    const { result } = this.state;
    this.setState({
      result: {
        ...result,
        username,
      },
    });
  };

  _handleChangePassword = (password) => {
    const { result } = this.state;
    this.setState({
      result: {
        ...result,
        password,
      },
    });
  };

  _handleLogin = () => {
    const { onLogin } = this.props;
    const { result } = this.state;
    onLogin(result);
  };

  _handleNext = () => {
    this._nextTextInput.focus();
  };

  _renderGetOtpText = () => {
    const { result } = this.state;
    const { translations, onClickGetOtp } = this.props;
    if (!translations || !translations.getOtp) {
      return null;
    }
    return (
      <TouchableOpacity
        style={styles.textGetOTP}
        onPress={() => {
          if (!result.username) {
            return Alert.alert(translations["pleseInputUserName"]);
          }
          onClickGetOtp && onClickGetOtp(result.username);
        }}
      >
        <FontIcon name="mail" size={16} color="#fff" />
        <View style={{ marginLeft: 8 }}>
          <P style={styles.lostPasswordText}>{translations.getOtp}</P>
        </View>
      </TouchableOpacity>
    );
  };
  _renderAlertError = () => {
    const { loginError, loginFbError } = this.props;
    return !!loginError || !!loginFbError ? (
      <MyAlert text={loginError} style={{ marginBottom: 10 }} />
    ) : null;
  };

  _renderContent = () => {
    const {
      colorPrimary,
      translations,
      onSkip,
      title,
      text,
      onNavigateRegister,
      onNavigateLostPassword,
      settings,
    } = this.props;
    const { result, isLoginLoading } = this.state;
    const { username, password } = result;
    return (
      <View style={[styles.box]}>
        <ScrollView
          keyboardDismissMode="none"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.boxContent}
        >
          <View style={[styles.logo, { alignSelf: 'center' }]}>
            <Image source={logo} resizeMode="contain" style={styles.img} />
          </View>
          {!!title && <H4 style={styles.title}>{title}</H4>}
          {!!text && <P style={styles.text}>{text}</P>}
          <View style={{ height: IOS ? 30 : 20 }} />
          {this._renderAlertError()}

          <View style={styles.inputWrapper}>
            <View style={styles.icon}>
              <FontIcon name="user" size={18} color="#fff" />
            </View>
            <TextInput
              placeholder={translations.username}
              style={styles.input}
              autoCapitalize="none"
              placeholderTextColor="#fff"
              underlineColorAndroid="transparent"
              autoCorrect={false}
              selectionColor="#fff"
              textContentType="username"
              value={username}
              returnKeyType="next"
              onChangeText={this._handleChangeUserName}
              onSubmitEditing={this._handleNext}
            />
          </View>
          <View style={styles.inputWrapper}>
            <View style={styles.icon}>
              <FontIcon name="key" size={18} color="#fff" />
            </View>
            <TextInput
              secureTextEntry
              ref={(c) => {
                this._nextTextInput = c;
              }}
              placeholder={translations.password}
              style={styles.input}
              placeholderTextColor="#fff"
              underlineColorAndroid="transparent"
              autoCorrect={false}
              selectionColor="#fff"
              returnKeyType="go"
              textContentType="password"
              value={password}
              onChangeText={this._handleChangePassword}
              onSubmitEditing={this._handleLogin}
              autoCapitalize="none"
            />
            {this._renderGetOtpText()}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
            <View style={{ flex: 1 }}>
              <Button
                backgroundColor="transparent"
                color="light"
                colorPrimary={colorPrimary}
                size="lg"
                radius="pill"
                block={true}
                loadingColor={colorPrimary}
                isLoading={isLoginLoading}
                onPress={this._handleLogin}
                style={{ borderWidth: 1, borderColor: '#fff', backgroundColor: 'transparent' }}
              >
                {translations.login}
              </Button>
            </View>
            <View style={{ width: 10 }} />
            <TouchableOpacity onPress={onSkip} style={{ paddingVertical: 12, paddingHorizontal: 8 }}>
              <P style={{ color: '#fff' }}>Or Skip</P>
            </TouchableOpacity>
          </View>

          {settings.isAllowRegistering === "yes" && (
            <Button
              backgroundColor="secondary"
              color="light"
              colorPrimary={colorPrimary}
              size="sm"
              radius="round"
              onPress={onNavigateRegister}
              renderBeforeText={() => (
                <View style={{ marginRight: 5 }}>
                  <FontIcon name="user-plus" size={16} color="#fff" />
                </View>
              )}
              style={{ marginTop: 20 }}
            >
              {translations.register}
            </Button>
          )}
          <TouchableOpacity
            style={styles.lostPassword}
            onPress={onNavigateLostPassword}
          >
            <FontIcon name="help-circle" size={16} color="#fff" />
            <View style={{ marginLeft: 8 }}>
              <P style={styles.lostPasswordText}>{translations.lostPassword}</P>
            </View>
          </TouchableOpacity>
          {this.props.renderBottom()}
        </ScrollView>
      </View>
    );
  };

  render() {
    const { onSkip, skipButtonText } = this.props;
    return (
      <View style={[styles.container]}>
        <StatusBar style="light" />
        <View style={styles.background}>
          <Image source={background} resizeMode="cover" style={styles.img} />
        </View>
        {null}
        {this._renderContent()}

        {/* <KeyboardAnimationRP style={{ flex: 1 }}>
          {this._renderContent}
        </KeyboardAnimationRP> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    height: screenHeight,
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#fff",
    paddingTop: IOS ? Constants.statusBarHeight : 0,
  },
  background: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  img: {
    width: "100%",
    height: "100%",
  },
  title: {
    color: "#fff",
    marginTop: 10,
    textAlign: "center",
  },
  text: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
  },
  box: {
    flex: 1,
    height: screenHeight,
    position: "relative",
  },
  boxContent: {
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    paddingTop: 80,
  },
  logo: {
    width: 150,
    height: 100,
    overflow: "hidden",
    margin: 10,
  },
  inputWrapper: {
    position: "relative",
    width: "100%",
  },
  icon: {
    position: "absolute",
    top: 0,
    left: 15,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    color: "#fff",
    paddingLeft: 45,
    paddingRight: 15,
    height: 48,
    borderRadius: 30,
    width: "100%",
    marginBottom: 10,
    fontSize: 14,
  },
  skip: {
    position: "absolute",
    zIndex: 9,
    top: Constants.statusBarHeight + (IOS ? 15 : 10),
    right: 15,
    backgroundColor: "transparent",
    paddingVertical: 2,
    paddingLeft: 10,
    paddingRight: 8,
    borderRadius: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  skipText: {
    color: "#fff",
    marginBottom: 0,
  },
  lostPassword: {
    marginTop: 5,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  textGetOTP: {
    paddingHorizontal: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
  },
  lostPasswordText: {
    color: "#fff",
    marginBottom: 0,
  },
  textError: {
    color: "#fff",
    textAlign: "center",
    fontSize: 14,
  },
});

export default FormFirstLogin;
