import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import Conexao from './src/database/Conexao';

export default function App() {
  const [statusBanco, setStatusBanco] = useState('Conectando ao banco...');

  useEffect(() => {
    Conexao.getInstancia()
      .abrir()
      .then(async (db) => {
        const { total } = await db.getFirstAsync(
          "SELECT COUNT(*) AS total FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"
        );
        setStatusBanco(`Banco conectado (${total} tabelas)`);
      })
      .catch((erro) => setStatusBanco(`Erro no banco: ${erro.message}`));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>FeiraFácil</Text>
      <Text style={styles.subtitulo}>Bem-vindo! O app está funcionando.</Text>
      <Text style={styles.status}>{statusBanco}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: '#555',
  },
  status: {
    marginTop: 16,
    fontSize: 14,
    color: '#888',
  },
});
