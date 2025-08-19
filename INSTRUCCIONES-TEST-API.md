# 🧪 Instrucciones para Probar la Integración con la API Real

## ✅ Configuración Actualizada

Tu `authService.ts` ahora está configurado para usar tu API real en:
**https://api-gym.extendsystem.com/api/v1**

## 🔍 Pasos para Probar

### 1. **Verificar Conectividad General**
```typescript
import { authService } from '../services/authService';

// Probar conectividad básica
const connectionTest = await authService.testConnection();
console.log('Test de conectividad:', connectionTest);
```

### 2. **Probar Endpoint de Login Específicamente**
```typescript
// Probar si el endpoint de login está disponible
const loginTest = await authService.testLoginEndpoint();
console.log('Test de endpoint login:', loginTest);
```

### 3. **Intentar Login Real**
```typescript
// Usar credenciales reales de tu API
const loginResult = await authService.login({
  email: 'tu-email-real@ejemplo.com',
  password: 'tu-password-real'
});

console.log('Resultado del login:', loginResult);
```

## 📋 Endpoints que Deberían Funcionar

Según tu documentación en [https://api-gym.extendsystem.com/api-docs/#/Authentication/post_api_v1_auth_login](https://api-gym.extendsystem.com/api-docs/#/Authentication/post_api_v1_auth_login):

- ✅ `POST /api/v1/auth/login` - Login de usuarios
- 🔄 `POST /api/v1/auth/refresh` - Refresh de token
- 🚪 `POST /api/v1/auth/logout` - Logout (opcional)

## 🚨 Posibles Problemas y Soluciones

### Problema 1: Error de CORS
**Síntoma:** Error de red sin respuesta del servidor
**Solución:** Verificar configuración CORS en tu backend

### Problema 2: Certificado HTTPS
**Síntoma:** Error de certificado o SSL
**Solución:** Verificar que tu certificado SSL sea válido

### Problema 3: Timeout
**Síntoma:** Error ECONNABORTED
**Solución:** El timeout ya está configurado en 15 segundos

### Problema 4: Endpoint no encontrado
**Síntoma:** Error 404
**Solución:** Verificar que la ruta sea exactamente `/api/v1/auth/login`

## 🔧 Debugging

### Logs que Deberías Ver:
```
🌐 API_BASE_URL configurada: https://api-gym.extendsystem.com/api/v1
🔍 Verificando conectividad con: https://api-gym.extendsystem.com/api/v1
✅ Servidor responde correctamente en endpoint raíz
📡 Respuesta del servidor: {"message":"API funcionando correctamente"}
🔐 Probando endpoint de login...
✅ Endpoint de login existe y está configurado correctamente
```

### Si Ves Errores:
1. **Verifica la URL** en la consola
2. **Revisa los logs de red** en las herramientas de desarrollador
3. **Prueba la API directamente** en Postman o similar

## 📱 Para Probar en la App

1. **Ejecuta la app** y ve a la pantalla de login
2. **Usa credenciales reales** de tu API
3. **Revisa la consola** para ver los logs de la API
4. **Verifica que no haya errores** de red o CORS

## 🆘 Si Sigue Fallando

### Opción 1: Verificar Backend
- Asegúrate de que tu API esté corriendo
- Verifica que el endpoint `/auth/login` esté implementado
- Revisa los logs del servidor

### Opción 2: Probar con Herramientas Externas
```bash
# Probar con curl
curl -X POST https://api-gym.extendsystem.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Opción 3: Verificar Variables de Entorno
```bash
# En tu archivo .env (si lo tienes)
EXPO_PUBLIC_API_BASE_URL=https://api-gym.extendsystem.com/api/v1
```

## 🎯 Resultado Esperado

Si todo está configurado correctamente, deberías ver:
1. ✅ Conectividad exitosa con la API
2. ✅ Endpoint de login disponible
3. ✅ Login exitoso con credenciales válidas
4. ✅ Token de acceso recibido

---

**¡Prueba estos pasos y me cuentas qué resultado obtienes!** 🚀
