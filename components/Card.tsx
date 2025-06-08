import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type CardProps = {
  title?: string;
  children: React.ReactNode;
  style?: any;
};

const Card: React.FC<CardProps> = ({ title, children, style }) => {
  const { colors } = useTheme();
  
  return (
    <View style={[
      styles.card, 
      { 
        backgroundColor: colors.card,
        shadowColor: colors.text,
        borderColor: colors.border
      },
      style
    ]}>
      {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    margin: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});

export default Card;