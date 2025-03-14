import React, { useState } from 'react';
import { TextInput, View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface CustomInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  isPassword?: boolean;
  keyboardType?: 'default' | 'email-address';
}

const CustomInput: React.FC<CustomInputProps> = ({ placeholder, value, onChangeText, isPassword = false, keyboardType = 'default' }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <StyledView className={`w-full mb-4 border ${isFocused ? 'border-blue-500' : 'border-gray-300'} rounded-lg`}>
      <StyledView className="flex-row items-center bg-white py-4 px-4 shadow-sm rounded-lg">
        <StyledTextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !passwordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType={keyboardType}
          className="flex-1 text-gray-800"
        />
        {isPassword && (
          <StyledTouchableOpacity onPress={togglePasswordVisibility} className="pl-3">
            <StyledText className="text-indigo-500">{passwordVisible ? 'Hide' : 'Show'}</StyledText>
          </StyledTouchableOpacity>
        )}
      </StyledView>
    </StyledView>
  );
};

export default CustomInput;
