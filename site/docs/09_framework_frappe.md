# Guía de Migración: Framework Frappe (Cambios Transversales)
## Frappe Framework v13 → v16.17.0

---

## Índice
1. [Resumen de Cambios](#1-resumen-de-cambios)
2. [Interfaz de Usuario y Navegación](#2-interfaz-de-usuario-y-navegación)
3. [Form Builder y Workflow Builder](#3-form-builder-y-workflow-builder)
4. [Sistema de Permisos](#4-sistema-de-permisos)
5. [APIs y Cambios Técnicos](#5-apis-y-cambios-técnicos)
6. [Formatos de Impresión](#6-formatos-de-impresión)
7. [Rendimiento y Requisitos Técnicos](#7-rendimiento-y-requisitos-técnicos)
8. [Otros Cambios Relevantes](#8-otros-cambios-relevantes)
9. [Pruebas de Validación (UAT)](#9-pruebas-de-validación-uat)

---

## 1. Resumen de Cambios

El Frappe Framework es la base sobre la que se ejecuta ERPNext. Los cambios en el framework afectan **todos los módulos** y la experiencia general del sistema.

| Área | Cambio | Impacto |
|------|--------|---------|
| UI/UX | **Nueva interfaz Espresso / Vue 3** | 🔴 Alto (visual) |
| Navegación | Sidebar rediseñado, Command Palette (Ctrl+K) | 🟡 Medio |
| Form Builder | Constructor visual de formularios | 🟡 Medio |
| Workflow Builder | Constructor visual de flujos de trabajo | 🟡 Medio |
| Permisos | Role Profile, User Type, permisos a nivel workspace | 🟡 Medio |
| APIs | Deprecaciones de APIs antiguas | 🔴 Alto (técnico) |
| Print | **Puppeteer** reemplaza wkhtmltopdf como motor PDF | 🔴 Alto |
| Performance | Caché mejorada, Vue 3, lazy loading | 🟢 Positivo |
| Requisitos | Python 3.11+, Node 20+, Redis 7+ | 🔴 Alto (infra) |

---

## 2. Interfaz de Usuario y Navegación

### 2.1 Evolución de la UI

| Versión | Cambios UI |
|---------|-----------|
| v14 | Nueva interfaz **Desk 2.0**: sidebar izquierdo, búsqueda global, centro de notificaciones |
| v15 | Sistema de diseño **Espresso**: más limpio, informativo, moderno |
| v16 | Frontend reescrito en **Vue 3 + Tailwind CSS**: rendering más rápido, componentes modernos |

### 2.2 Navegación Principal (v16)

**Sidebar (Barra Lateral):**
- Sidebar persistente y colapsable en el lado izquierdo
- Secciones:
  - **Workspaces pinneados**: Accesos directos a módulos frecuentes
  - **Documentos recientes**: Últimos documentos visitados
  - **Favoritos**: Documentos marcados como favoritos
- Se puede reorganizar arrastrando elementos

**Command Palette (Paleta de Comandos):**
- Acceso: **Ctrl+K** (o **Cmd+K** en Mac)
- Permite:
  - Buscar cualquier documento, reporte o configuración
  - Navegar directamente a un doctype
  - Ejecutar acciones rápidas
  - Crear nuevos documentos

**Workspaces:**
- Los **Workspaces** reemplazaron los antiguos dashboards (desde v14)
- Cada módulo tiene un workspace con:
  - Shortcuts (accesos directos)
  - Charts (gráficas)
  - Number Cards (tarjetas numéricas)
  - Links (enlaces a listas y reportes)
- Los usuarios pueden personalizar sus workspaces

### 2.3 List View (Vista de Lista)

| Característica | v13 | v16 |
|---------------|-----|-----|
| Rendering | Server-side HTML | API + client-side rendering (más rápido) |
| Vista Kanban | Básica | Mejorada con drag-and-drop |
| Calendar | Básica | Integrada con agenda |
| Inline Editing | No disponible | Disponible para campos seleccionados |
| Bulk Actions | Limitadas | Select All, Copy to Clipboard, acciones masivas |
| Filtros | Básicos | Avanzados con guardado de filtros |

### 2.4 Form View (Vista de Formulario)

- **Pestañas (Tabs):** Los formularios largos se organizan en pestañas en lugar de una sola página
- **Sidebar del formulario:** Muestra metadatos, asignaciones, comentarios, etiquetas
- **Build Mode (v16):** Permite rearreglar campos, agregar secciones y columnas directamente desde el formulario sin código

---

## 3. Form Builder y Workflow Builder

### 3.1 Form Builder

**¿Qué es?** Una herramienta visual para crear y editar doctypes y Custom Fields sin escribir código.

**Evolución:**
| Versión | Capacidad |
|---------|-----------|
| v14 | Drag-and-drop para Custom Fields básicos |
| v15 | Agregar secciones, columnas, tabs vía UI |
| v16 | **Build Mode** completo: rearreglar campos, agregar lógica condicional, crear campos calculados |

**Cómo acceder (v16):**
1. Abrir cualquier formulario
2. Hacer clic en el icono de **Build Mode** (generalmente un ícono de engranaje o llave inglesa)
3. Los campos se vuelven movibles
4. Arrastrar campos para reorganizar
5. Hacer clic en "+" para agregar nuevos campos
6. Configurar visibilidad condicional sin código

### 3.2 Workflow Builder

**¿Qué es?** Una herramienta visual para diseñar flujos de trabajo de aprobación y automatización.

**Evolución:**
| Versión | Capacidad |
|---------|-----------|
| v14 | Constructor visual básico de estados y transiciones |
| v15 | Triggers para server scripts, email alerts |
| v16 | Condiciones anidadas, triggers múltiples, integración completa con Server Scripts |

**Cómo usarlo:**
1. Ir a **Settings → Workflow → Nuevo**
2. Se abre el constructor visual
3. Agregar **estados** (ej: Draft, Pending Approval, Approved, Rejected)
4. Definir **transiciones** entre estados con:
   - Rol permitido
   - Condiciones (fórmulas)
   - Acciones automáticas (enviar email, ejecutar script)
5. Guardar y vincular al doctype deseado

**Ejemplo de flujo de aprobación de compras:**
```
Draft → Submit (any role)
  ↓
Pending Approval → Approve (Purchase Manager) [if amount > 10000]
  ↓                → Reject (Purchase Manager)
Approved → Create PO (Purchase User)
```

---

## 4. Sistema de Permisos

### 4.1 Cambios en el Modelo de Permisos

| Versión | Cambio |
|---------|--------|
| v14 | **Role Permissions Manager** reemplaza el viejo Permission Manager. Permisos a nivel de campo. |
| v15 | **User Type** (System User, Website User). Compartir documentos con expiración. |
| v16 | **Role Profile** para asignación masiva de roles. Permisos a nivel de workspace. |

### 4.2 Role Profile (v16)

**¿Qué es?** Un conjunto predefinido de roles que se asigna a un usuario.

**Ejemplo:**
- Role Profile "Contador" = Roles: Accounts User, Accounts Manager, Report Builder
- Role Profile "Vendedor" = Roles: Sales User, Report Builder, POS User

**Cómo configurar:**
1. Ir a **Settings → Role Profile → Nuevo**
2. Nombrar el perfil
3. Seleccionar los roles que incluye
4. Guardar
5. Al crear o editar un usuario, asignar el Role Profile
6. Los roles se aplican automáticamente

### 4.3 Permisos a Nivel de Campo

- Desde v14, se pueden definir permisos de lectura/escritura para **campos individuales**
- Ejemplo: Solo el rol "HR Manager" puede ver el campo "Salario" en el doctype "Employee"
- Se configura desde: **Role Permissions Manager → Field Level Permissions**

### 4.4 User Type

- **System User**: Acceso completo al Desk (backend)
- **Website User**: Acceso solo al portal web
- Se define al crear el usuario
- Afecta qué interfaz ve el usuario al iniciar sesión

---

## 5. APIs y Cambios Técnicos

### 5.1 APIs Deprecadas

| API Deprecada | Reemplazo | Versión |
|--------------|-----------|---------|
| `frappe.desk.form.load.getdoc` | `frappe.client.get` | v14 |
| `frappe.pages.*` APIs | Frappe UI (Vue components) | v15 |
| `frappe.widgets` | New Dashboard API | v15 |
| Antiguas APIs de `frappe.desk` | REST API con OpenAPI 3.0 | v16 |

### 5.2 REST API Mejorada

- **OpenAPI 3.0 Specification**: La API REST ahora tiene documentación automática
- **Endpoint estándar**: `/api/resource/{doctype}`
- **Autenticación**: API Key + Secret, OAuth2, Bearer Token
- **Nuevas capacidades**:
  - Filtros avanzados
  - Paginación con `limit_start` y `limit_page_length`
  - Selección de campos con `fields`
  - Ordenamiento con `order_by`

### 5.3 GraphQL API (v16 - Experimental)

- Endpoint: `/api/method/frappe.api.graphql`
- Permite consultas más eficientes para frontends personalizados
- Aún experimental — no recomendado para producción crítica

### 5.4 Server Scripts

- Scripts del lado del servidor ejecutables desde la UI
- Soportan eventos: Before Insert, After Insert, Before Submit, etc.
- También pueden crear **API endpoints** personalizados
- Mejorados en cada versión con más hooks y capacidades

### 5.5 Cambios en frappe.call

- `frappe.call` sigue funcionando pero se recomienda usar la REST API para integraciones externas
- Los métodos whitelisted (`@frappe.whitelist()`) siguen disponibles
- Nuevos decoradores para validación de permisos

---

## 6. Formatos de Impresión

### 6.1 Motor de PDF

| Versión | Motor | Notas |
|---------|-------|-------|
| v13 | **wkhtmltopdf** | Motor por defecto |
| v15 | **Puppeteer** (Chrome Headless) | Se convierte en el motor por defecto |
| v16 | **Puppeteer** | Único motor soportado oficialmente |

> ⚠️ **Impacto:** Los formatos de impresión personalizados que dependían de quirks de wkhtmltopdf pueden renderizarse de manera diferente con Puppeteer.

### 6.2 Cambios en Formatos de Impresión

| Aspecto | v13 | v16 |
|---------|-----|-----|
| Constructor | Básico | **Print Format Builder** con drag-and-drop |
| Motor | wkhtmltopdf | Puppeteer (Chrome headless) |
| Scripting | Jinja | Jinja + JS scripting mejorado |
| Preview | Requería generar PDF | Preview en vivo en el Desk |
| CSS | CSS específico para wkhtmltopdf | CSS estándar Chrome-compatible |

### 6.3 Acciones Requeridas

1. **Revisar todos los formatos de impresión personalizados** después de la migración
2. Verificar que se renderizan correctamente con Puppeteer
3. Ajustar CSS si hay diferencias de renderizado
4. Probar la generación de PDF para cada formato
5. Verificar márgenes, encabezados, pies de página

---

## 7. Rendimiento y Requisitos Técnicos

### 7.1 Requisitos de Infraestructura

| Componente | v13 | v16 | Acción |
|-----------|-----|-----|--------|
| **Python** | 3.8-3.9 | **3.11+** | Actualizar Python |
| **Node.js** | 14 | **20+** | Actualizar Node |
| **MariaDB** | 10.3+ | **10.6+** | Verificar/actualizar |
| **Redis** | 5.0+ | **7.0+** | Actualizar Redis |
| **Puppeteer** | No requerido | **Requerido** (Chrome headless) | Instalar |

### 7.2 Mejoras de Rendimiento

| Área | Mejora | Versión |
|------|--------|---------|
| Caché | Redis caching para metadatos, ORM lazy loading | v14 |
| Listas | Paginación server-side, rendering vía API | v15-v16 |
| Reportes | Ejecución en segundo plano para reportes pesados | v15 |
| Frontend | Vue 3 con Tailwind → rendering más rápido | v16 |
| Archivos | Soporte para S3/MinIO como almacenamiento externo | v15 |
| Background | Redis Queue mejorado para tareas en segundo plano | v14 |
| Base de datos | Connection pooling, consultas optimizadas | v15 |

### 7.3 Frappe Caffeine (v16)

- Arquitectura de caché completamente rediseñada
- **Hasta 2x más rápido** en carga de páginas y generación de reportes
- Afecta positivamente todos los módulos

---

## 8. Otros Cambios Relevantes

### 8.1 Webhooks

- Mejorados para soportar todos los eventos de doctype
- Triggers condicionales: el webhook solo se dispara si se cumple una condición
- Soporte para headers personalizados y autenticación

### 8.2 File Attachments

- v15+: Soporte para almacenamiento externo (S3, MinIO) como primario
- Los archivos adjuntos pueden almacenarse fuera del servidor
- CDN support para archivos públicos

### 8.3 Notifications (Notificaciones)

- v16: Capacidad de adjuntar archivos a las notificaciones
- Notificaciones por email, push y en-app
- Templates de notificación mejorados

### 8.4 Number Cards

- v16: Opción de mostrar números completos (sin abreviación)
- Antes: "1.2M" → Ahora puede mostrar: "1,200,000"

### 8.5 Bulk Actions

- v16: **Select All** checkbox en campos multiselect
- **Copy to Clipboard** como acción masiva en List y Report views
- Soporte para acciones masivas personalizadas

---

## 9. Pruebas de Validación (UAT)

---

### UAT-FW-01: Navegación y Workspace

**Objetivo:** Verificar la navegación principal del sistema.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Verificar que el **sidebar** se muestra correctamente | Sidebar visible con workspaces |
| 2 | Hacer clic en diferentes workspaces | Los workspaces se cargan correctamente |
| 3 | Usar el **Command Palette** (Ctrl+K / Cmd+K) | La paleta se abre y permite buscar |
| 4 | Buscar un documento específico en el Command Palette | El documento se encuentra y se puede abrir |
| 5 | Pinnear un workspace al sidebar | El workspace aparece en la sección pinneada |
| 6 | Verificar los documentos recientes en el sidebar | Los últimos documentos visitados aparecen |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-FW-02: List View (Vista de Lista)

**Objetivo:** Verificar las funcionalidades de la vista de lista.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Abrir la lista de un doctype (ej: Sales Order) | La lista se carga rápidamente |
| 2 | Cambiar a vista **Kanban** | Los documentos se agrupan en columnas |
| 3 | Arrastrar un documento entre columnas Kanban | El estado del documento cambia |
| 4 | Usar filtros avanzados | Los resultados se filtran correctamente |
| 5 | Guardar un conjunto de filtros | Los filtros se guardan y se pueden reutilizar |
| 6 | Seleccionar múltiples documentos y usar **Bulk Action** | La acción se aplica a todos los seleccionados |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-FW-03: Form View con Tabs (Vista de Formulario)

**Objetivo:** Verificar los formularios con pestañas.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Abrir un documento con formulario largo (ej: Sales Invoice) | El formulario se carga con pestañas |
| 2 | Navegar entre las pestañas | Los campos se muestran correctamente en cada tab |
| 3 | Verificar el sidebar del formulario | Metadatos, comentarios, asignaciones visibles |
| 4 | Agregar un comentario | El comentario se guarda y se muestra |
| 5 | Asignar el documento a otro usuario | La asignación se registra |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-FW-04: Permisos y Role Profile

**Objetivo:** Verificar el sistema de permisos.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear un **Role Profile** con 3 roles | Profile creado |
| 2 | Asignar el Role Profile a un usuario de prueba | Roles aplicados automáticamente |
| 3 | Iniciar sesión con el usuario de prueba | Solo los módulos permitidos son visibles |
| 4 | Verificar permisos de lectura/escritura por doctype | Los permisos se aplican correctamente |
| 5 | Verificar permisos a nivel de campo (si configurados) | Los campos restringidos no son visibles/editables |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-FW-05: Formatos de Impresión

**Objetivo:** Verificar que los formatos de impresión se renderizan correctamente.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Abrir una Factura de Venta enviada | Factura visible |
| 2 | Hacer clic en **Print** (Imprimir) | La vista previa se muestra en el Desk |
| 3 | Verificar que el formato se ve correctamente | Layout, fuentes, márgenes correctos |
| 4 | Generar PDF | El PDF se descarga correctamente |
| 5 | Comparar el PDF con el formato de v13 | La apariencia es similar o mejorada |
| 6 | Probar otros formatos personalizados | Todos los formatos se renderizan correctamente |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-FW-06: Workflow Builder

**Objetivo:** Verificar que los workflows funcionan correctamente.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Abrir un workflow existente en el **Workflow Builder** | El flujo visual se muestra |
| 2 | Verificar que los estados y transiciones son correctos | Coinciden con la configuración |
| 3 | Crear un documento y ejecutar el workflow | Las transiciones de estado funcionan |
| 4 | Verificar que las notificaciones se envían | Los emails/notificaciones se disparan |
| 5 | Verificar los permisos por estado | Solo los roles autorizados pueden cambiar estado |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-FW-07: Búsqueda y Filtros

**Objetivo:** Verificar las capacidades de búsqueda.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Usar la **búsqueda global** en el header | Los resultados incluyen todos los doctypes |
| 2 | Buscar un documento por nombre parcial | El documento se encuentra |
| 3 | Buscar un doctype y navegar a su lista | La lista se abre |
| 4 | Usar **Ctrl+K** (Command Palette) para buscar | La búsqueda es rápida y precisa |
| 5 | Verificar que los resultados de búsqueda respetan permisos | Solo se muestran documentos permitidos |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-FW-08: Rendimiento General

**Objetivo:** Verificar que el sistema es más rápido que v13.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Medir tiempo de carga de la página principal | ≤ 3 segundos |
| 2 | Medir tiempo de carga de una lista con 100+ registros | ≤ 2 segundos |
| 3 | Medir tiempo de carga de un formulario complejo | ≤ 2 segundos |
| 4 | Generar un reporte pesado (ej: Trial Balance) | Se genera sin timeout |
| 5 | Verificar que reportes pesados se ejecutan en segundo plano | Se muestra indicador de progreso |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-FW-09: Custom Scripts y Personalización

**Objetivo:** Verificar que las personalizaciones existentes funcionan.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Verificar que los **Client Scripts** existentes funcionan | Scripts se ejecutan sin errores |
| 2 | Verificar que los **Custom Fields** se muestran | Los campos personalizados aparecen |
| 3 | Verificar que los **Custom Print Formats** se renderizan | Los formatos se ven correctamente |
| 4 | Verificar que los **Server Scripts** funcionan | Scripts se ejecutan sin errores |
| 5 | Verificar que los **Custom Reports** se ejecutan | Los reportes muestran datos correctos |

**Resultado:** ☐ PASA / ☐ FALLA

---

*Guía de cambios del Framework Frappe — Dossier de Migración ERPNext v13 → v16*
