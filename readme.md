# 📏 Medición de Alturas Forestales PWA v1.1

## 📋 Descripción
Aplicación web progresiva (PWA) para el registro profesional de mediciones de altura en árboles forestales, utilizando los métodos **265** e **India**. Diseñada para trabajo de campo sin conexión a internet.

## ✨ Características Principales

### 🎯 Funcionalidades Core
- **Dos métodos de medición:** 265 e India
- **Registro por segmentos:** Medición segmentada con altura comercial
- **Gestión de lotes:** Crear, guardar y reabrir lotes
- **Edición completa:** Todos los datos son editables
- **Cálculo automático:** Suma de alturas totales por árbol
- **Exportación CSV:** Formato compatible con Excel
- **100% Offline:** Funciona sin conexión después de la primera carga
- **PWA Instalable:** Se instala como app nativa

### 📊 Estructura de Datos

```
Lote
├── Árbol 1
│   ├── Medición 265
│   │   ├── Segmento 1: altura acumulada (largo del segmento)
│   │   ├── Segmento 2: altura acumulada (largo del segmento)
│   │   └── Segmento n: altura acumulada (largo del segmento)
│   └── Medición India
│       ├── Segmento 1: altura acumulada (largo del segmento)
│       ├── Segmento 2: altura acumulada (largo del segmento)
│       └── Segmento n: altura acumulada (largo del segmento)
├── Árbol 2
│   └── ...
└── Árbol n
```

### 📏 Sistema de Medición Acumulativa

Las alturas se registran de forma **acumulativa** desde el suelo:
- **Segmento 1:** 3.26m (altura desde suelo) → Largo: 3.26m
- **Segmento 2:** 5.29m (altura desde suelo) → Largo: 2.03m (5.29 - 3.26)
- **Segmento 3:** 9.56m (altura desde suelo) → Largo: 4.27m (9.56 - 5.29)
- **Altura Total:** 9.56m (último valor acumulado)

El sistema calcula automáticamente:
- **Largo de cada segmento:** Diferencia entre altura actual y anterior
- **Altura total:** Último valor de altura acumulada
- **Validaciones:** Cada altura debe ser mayor que la anterior

## 🔄 Flujo de Trabajo

### 1. **Iniciar Nuevo Lote**
- Ingrese nombre del lote
- Click en "📂 Nuevo Lote"

### 2. **Medición de Árbol**
- **Árbol 1 - Tipo 265:**
  - Agregar segmento 1: 3.26m (altura desde suelo)
  - Agregar segmento 2: 5.29m (altura acumulada)
  - Agregar segmento 3: 9.56m (altura acumulada)
  - El sistema calcula automáticamente el largo de cada segmento
  - Click "💾 Guardar Árbol/Tipo/Segmentos"
  
- **Árbol 1 - Tipo India:** (automático después de 265)
  - Agregar segmentos con alturas acumulativas
  - Click "💾 Guardar Árbol/Tipo/Segmentos"
  
- **Click "➡️ Siguiente Árbol"** para continuar

### 3. **Guardar Lote**
- Click "💾 Guardar Lote" para guardar en memoria
- Puede reabrir y continuar más tarde

### 4. **Exportar Datos**
- Click "📥 Exportar CSV" para descargar

## 📱 Instalación

### Opción 1: Como PWA
1. Abrir en Chrome móvil
2. Menú (⋮) → "Agregar a pantalla de inicio"
3. Confirmar instalación

### Opción 2: Desde PC
1. Subir archivos a servidor web o GitHub Pages
2. Acceder desde navegador móvil
3. Instalar como PWA

## 📁 Archivos Necesarios

```
medicion-alturas/
├── index.html        # Estructura HTML
├── styles.css        # Estilos
├── app.js           # Lógica JavaScript
├── manifest.json    # Configuración PWA
├── sw.js           # Service Worker
├── icon-192.png    # Icono pequeño
└── icon-512.png    # Icono grande
```

## 💾 Estructura del CSV Exportado

```csv
Lote,Arbol,Tipo,Segmento,Altura_Acumulada_m,Largo_Segmento_m,Altura_Total_m
Bosque Norte,1,265,1,3.26,3.26,9.56
Bosque Norte,1,265,2,5.29,2.03,9.56
Bosque Norte,1,265,3,9.56,4.27,9.56
Bosque Norte,1,India,1,2.85,2.85,8.75
Bosque Norte,1,India,2,6.25,3.40,8.75
Bosque Norte,1,India,3,8.75,2.50,8.75
Bosque Norte,2,265,1,4.75,4.75,12.30
Bosque Norte,2,265,2,8.90,4.15,12.30
Bosque Norte,2,265,3,12.30,3.40,12.30
```

### Columnas del CSV:
- **Lote:** Nombre del lote forestal
- **Arbol:** Número de árbol
- **Tipo:** Método de medición (265 o India)
- **Segmento:** Número de segmento
- **Altura_Acumulada_m:** Altura desde el suelo hasta ese punto
- **Largo_Segmento_m:** Largo real del segmento (calculado automáticamente)
- **Altura_Total_m:** Altura total del árbol (último valor acumulado)

## 🛠️ Características Técnicas

### Edición de Datos
- ✏️ Click en lápiz para editar cualquier medición
- × Click en X para eliminar segmentos
- Todos los cambios se guardan automáticamente

### Gestión de Lotes
- **Nuevo:** Crear lote desde cero
- **Abrir:** Continuar lote guardado
- **Guardar:** Almacenar en memoria del dispositivo
- **Exportar:** Descargar como CSV

### Validaciones
- Alturas con 2 decimales precisos
- Alturas acumulativas (cada altura debe ser mayor que la anterior)
- Números de segmento consecutivos automáticos
- Cálculo automático del largo de cada segmento
- Validación de campos requeridos

## 🎯 Casos de Uso

### Inventario Forestal
- Medición de altura comercial
- Cubicación de madera
- Estudios dendrométricos

### Ventajas del Sistema
- Sin papel en campo
- Cálculos automáticos
- Datos digitales inmediatos
- Sin pérdida de información
- Trabajo sin internet

## ⚙️ Configuración Avanzada

### Para GitHub Pages
1. Crear repositorio: `medicion-alturas-pwa`
2. Subir los 7 archivos
3. Activar GitHub Pages
4. URL: `https://[usuario].github.io/medicion-alturas-pwa`

### Personalización
- Colores: Editar variables CSS en `:root`
- Métodos: Modificar opciones en `select#tipoMedicion`
- Decimales: Ajustar `toFixed(2)` en JavaScript

## 📊 Diferencias con App de Inventario

| Característica | Inventario (DAP) | Medición Alturas |
|---------------|------------------|------------------|
| Medición | Diámetro único | Alturas acumulativas con segmentos |
| Métodos | N/A | 265 e India |
| Flujo | Lineal | Por árbol/tipo |
| Color | Verde | Azul |
| Cálculo | CAP | Altura total y largo de segmentos |
| Sistema | Valor directo | Valores acumulativos |

## 🔧 Solución de Problemas

### No se instala como app
- Verificar HTTPS
- Limpiar caché del navegador
- Usar Chrome o Edge

### Datos no se guardan
- Verificar espacio en dispositivo
- No usar modo incógnito
- Permitir almacenamiento local

### CSV no se descarga
- Verificar permisos de descarga
- Revisar carpeta de descargas

## 📝 Notas Importantes

1. **Respaldo:** Exportar CSV regularmente
2. **Límites:** Sin límite de árboles o segmentos
3. **Precisión:** 2 decimales para alturas
4. **Offline:** Primera carga requiere internet

## 🚀 Actualizaciones Futuras

- [ ] Sincronización en la nube
- [ ] Gráficos de distribución de alturas
- [ ] Fotos por árbol
- [ ] GPS por medición
- [ ] Cálculo de volumen

## 📱 Compatibilidad

- ✅ Chrome Android (v80+)
- ✅ Samsung Internet
- ✅ Edge Mobile
- ✅ Firefox Android
- ✅ Safari iOS (limitado)

## 👨‍💻 Desarrollo

**Versión:** 1.1  
**Fecha:** Noviembre 2024  
**Stack:** HTML5, CSS3, JavaScript ES6, PWA  
**Actualización:** Sistema de alturas acumulativas con cálculo de largos

---

**Para soporte o sugerencias, mantener registro de issues en el repositorio.**