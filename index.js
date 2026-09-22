// Ponto de entrada do app. As tarefas em segundo plano (geofence) precisam estar definidas antes de o app subir, inclusive quando
// o sistema o acorda sem nenhuma tela: por isso vêm antes do Expo Router. Ver https://docs.expo.dev/router/installation/
import './src/tarefas';
import 'expo-router/entry';
