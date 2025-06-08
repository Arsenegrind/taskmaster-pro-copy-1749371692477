import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type ButtonProps = {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  style?: any;
};

const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  type = 'primary', 
  disabled = false,
  style
}) => {
  const { colors } = useTheme();
  
  let backgroundColor;
  let textColor;
  let borderColor;
  
  switch (type) {
    case 'primary':
      backgroundColor = colors.primary;
      textColor = '#FFFFFF';
      borderColor = colors.primary;
      break;
    case 'secondary':
      backgroundColor = colors.secondary;
      textColor = '#FFFFFF';
      borderColor = colors.secondary;
      break;
    case 'outline':
      backgroundColor = 'transparent';
      textColor = colors.primary;
      borderColor = colors.primary;
      break;
    default:
      backgroundColor = colors.primary;
      textColor = '#FFFFFF';
      borderColor = colors.primary;
  }
  
  if (disabled) {
    backgroundColor = type === 'outline' ? 'transparent' : '#CCCCCC';
    textColor = '#999999';
    borderColor = '#CCCCCC';
  }
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor, borderColor },
        style
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Button;