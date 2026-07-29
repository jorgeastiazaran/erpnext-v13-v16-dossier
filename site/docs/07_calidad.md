# Guía de Migración: Módulo de Calidad (Quality Management)
## ERPNext v13 → v16

---

## Índice
1. [Resumen de Cambios](#1-resumen-de-cambios)
2. [Cambios Detallados por Versión](#2-cambios-detallados-por-versión)
3. [Nuevas Funcionalidades](#3-nuevas-funcionalidades)
4. [Cambios Rompientes y Acciones Requeridas](#4-cambios-rompientes-y-acciones-requeridas)
5. [Cambios en la Interfaz de Usuario](#5-cambios-en-la-interfaz-de-usuario)
6. [Pruebas de Validación (UAT)](#6-pruebas-de-validación-uat)

---

## 1. Resumen de Cambios

| Área | Cambio | Impacto |
|------|--------|---------|
| No Conformidades | Nuevo doctype **Non-Conformance** (v14) | 🟡 Medio |
| CAPA | **Corrective Action** / **Preventive Action** (v14) | 🟡 Medio |
| Auto-inspección | Creación automática de inspecciones (v15) | 🟡 Medio |
| Feedback | **Quality Feedback** para retroalimentación (v15) | 🟢 Bajo |
| Revisiones | **Quality Review** para revisiones periódicas (v15) | 🟢 Bajo |
| Trazabilidad | Inspección por lote/serie (v16) | 🟡 Medio |
| Aprobaciones | Workflow de aprobación para No Conformidades (v16) | 🟢 Bajo |

---

## 2. Cambios Detallados por Versión

### 2.1 Cambios en v14 (desde v13)

#### a) Non-Conformance (No Conformidad) ⭐
- Nuevo doctype para registrar formalmente las fallas de calidad
- Se crea cuando una **Quality Inspection** tiene resultado "Rejected"
- Campos principales:
  - Artículo y lote afectado
  - Descripción de la no conformidad
  - Gravedad (Crítica, Mayor, Menor)
  - Vinculación al proveedor o proceso responsable
  - Estado del tratamiento

#### b) Corrective Action / Preventive Action (CAPA)
- Nuevos doctypes para gestionar acciones correctivas y preventivas
- **Corrective Action**: Acción para corregir la causa raíz de una no conformidad existente
- **Preventive Action**: Acción para prevenir la ocurrencia de una potencial no conformidad
- Campos: Descripción, responsable, fecha límite, evidencia de cierre, efectividad
- Se vinculan directamente a la **Non-Conformance**

#### c) Quality Inspection Mejorada
- Checklist de inspección mejorado con más tipos de lectura
- Soporte para inspección contra Purchase Receipt, Delivery Note, Stock Entry y Work Order
- Criterios de aceptación configurables por parámetro (rango, valor exacto, visual)
- Resultado automático basado en lecturas vs criterios

### 2.2 Cambios en v15 (desde v14)

#### a) Auto-creación de Inspecciones
- En el **Quality Inspection Template**, se puede configurar "Auto Create Inspection"
- Cuando se activa, el sistema crea automáticamente una inspección al:
  - Crear un **Purchase Receipt** (inspección de recepción)
  - Crear una **Delivery Note** (inspección de despacho)
  - Completar un **Work Order** (inspección de producto terminado)
- Si la inspección es requerida, la transacción se bloquea hasta que la inspección se complete

#### b) Quality Review (Revisión de Calidad)
- Nuevo doctype para registrar revisiones periódicas de calidad
- Puede vincularse a un procedimiento de calidad
- Campos: Participantes, hallazgos, acciones acordadas, fecha de seguimiento

#### c) Quality Feedback (Retroalimentación de Calidad)
- Nuevo doctype para capturar retroalimentación de clientes o partes internas
- Se vincula a artículos o procesos específicos
- Permite categorizar: Queja, Sugerencia, Reconocimiento
- Puede generar automáticamente una Non-Conformance si es una queja crítica

#### d) Non-Conformance vinculable
- Las No Conformidades ahora pueden vincularse a: Proveedor, Artículo, Cliente, Proceso
- Mejoras en el seguimiento y categorización

### 2.3 Cambios en v16 (desde v15)

#### a) Inspección por Lote/Serie
- Si un artículo tiene lotes o series y requiere inspección, cada lote puede inspeccionarse por separado
- Los resultados de inspección se vinculan al lote/serie específico
- Mejora la trazabilidad de calidad para lotes rechazados

#### b) Workflow de Aprobación para Non-Conformance
- Las No Conformidades ahora tienen un flujo de aprobación configurable:
  - Registro → Investigación → Acción Propuesta → Aprobación → Cierre
- Se pueden asignar responsables por etapa
- Notificaciones automáticas en cada cambio de estado

#### c) Checklists con Rich Text e Imágenes
- Los checklists de inspección ahora soportan:
  - Texto enriquecido (negritas, listas, etc.)
  - Carga de imágenes como evidencia
  - Campos de firma digital

#### d) Reportes Mejorados
- **Non-Conformance Analysis**: Análisis de tendencias de no conformidades
- **Quality Inspection Summary**: Resumen de inspecciones por período
- **CAPA Effectiveness Report**: Efectividad de acciones correctivas/preventivas

---

## 3. Nuevas Funcionalidades

### 3.1 Non-Conformance y CAPA

**Flujo completo:**

```
Quality Inspection (Rechazada)
    ↓
Non-Conformance (Registro)
    ↓
Investigación (Análisis de Causa Raíz)
    ↓
Corrective Action (Acción Correctiva)
    y/o
Preventive Action (Acción Preventiva)
    ↓
Verificación de Efectividad
    ↓
Cierre
```

**Cómo usar:**
1. Una **Quality Inspection** con resultado "Rejected" genera (automática o manualmente) una **Non-Conformance**
2. El responsable de calidad investiga y documenta la causa raíz
3. Se crean **Corrective Actions** y/o **Preventive Actions**
4. Se asignan responsables y fechas límite
5. El responsable implementa la acción y documenta la evidencia
6. Calidad verifica la efectividad
7. Se cierra la No Conformidad

### 3.2 Auto-creación de Inspecciones

**Configuración:**
1. Ir al maestro del **Item** (artículo)
2. En la sección de calidad, activar:
   - **Inspection Required Before Purchase** (inspección requerida antes de recibir)
   - **Inspection Required Before Delivery** (inspección requerida antes de entregar)
3. Vincular un **Quality Inspection Template** al artículo
4. Al crear un Purchase Receipt o Delivery Note para ese artículo, el sistema:
   - Crea automáticamente la Quality Inspection
   - Bloquea el envío de la transacción hasta que la inspección se complete

### 3.3 Quality Feedback

**Cómo usar:**
1. Ir a **Calidad → Quality Feedback → Nuevo**
2. Seleccionar tipo: Queja, Sugerencia, Reconocimiento
3. Vincular al artículo, proveedor, cliente o proceso
4. Describir la retroalimentación
5. Si es una queja crítica, hacer clic en **Create Non-Conformance**
6. La no conformidad se crea automáticamente con los datos del feedback

---

## 4. Cambios Rompientes y Acciones Requeridas

### 4.1 Inspección Obligatoria

| Aspecto | Impacto | Acción |
|---------|---------|--------|
| Items con inspección obligatoria | Los Purchase Receipts y Delivery Notes se bloquean | Configurar solo para artículos que realmente requieran inspección |
| Recepción masiva | Puede causar retrasos si hay muchos artículos con inspección | Evaluar qué artículos necesitan inspección obligatoria |
| Datos históricos | Las transacciones existentes no se ven afectadas | Solo aplica para nuevas transacciones |

### 4.2 Non-Conformance

- Si previamente tenían un sistema personalizado de gestión de no conformidades, puede conflictar con el sistema estándar
- Los scripts o apps personalizados de calidad deben evaluarse para posible conflicto
- Los dashboards de calidad personalizados deben actualizarse para incluir Non-Conformance

### 4.3 Quality Action (Acción de Calidad)

- El doctype antiguo **Quality Action** podría estar deprecado en favor de Corrective/Preventive Action
- Verificar si los datos de Quality Action se migran a los nuevos doctypes

---

## 5. Cambios en la Interfaz de Usuario

### 5.1 Quality Inspection
- Formulario mejorado con gráfica de pasa/falla
- Grid de captura de defectos
- Soporte para imágenes y firma digital (v16)
- Link directo para crear Non-Conformance si falla

### 5.2 Non-Conformance
- Formulario con sección de **Root Cause Analysis** (Análisis de Causa Raíz)
- Timeline de acciones (CAPA) vinculadas
- Indicador visual de estado y gravedad

### 5.3 Workspace de Calidad
- Dashboard con métricas clave:
  - Inspecciones pendientes
  - No conformidades abiertas
  - CAPA pendientes de cierre
  - Tasa de rechazo por período

---

## 6. Pruebas de Validación (UAT)

---

### UAT-CAL-01: Quality Inspection Estándar

**Objetivo:** Verificar el flujo básico de inspección de calidad.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear un **Quality Inspection Template** con parámetros | Template creado con criterios |
| 2 | Vincular el template a un artículo | Artículo configurado |
| 3 | Crear una **Quality Inspection** manualmente | Formulario con parámetros del template |
| 4 | Ingresar lecturas dentro de rango → resultado "Accepted" | Inspección pasa |
| 5 | Crear otra inspección con lecturas fuera de rango | Resultado: "Rejected" |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-CAL-02: Auto-creación de Inspección en Recepción

**Objetivo:** Verificar que la inspección se crea automáticamente al recibir material.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Configurar artículo con **Inspection Required Before Purchase = Yes** | Artículo configurado |
| 2 | Crear un Purchase Receipt para ese artículo | Recibo creado |
| 3 | Intentar enviar el Purchase Receipt sin inspección | **El sistema bloquea** el envío |
| 4 | Verificar que se creó una **Quality Inspection** automáticamente | La inspección existe |
| 5 | Completar la inspección con resultado "Accepted" | Inspección aprobada |
| 6 | Enviar el Purchase Receipt | El recibo se envía exitosamente |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-CAL-03: Non-Conformance desde Inspección Rechazada

**Objetivo:** Verificar el flujo de inspección rechazada → no conformidad.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear una Quality Inspection con resultado "Rejected" | Inspección rechazada |
| 2 | Hacer clic en **Create Non-Conformance** | Se abre el formulario pre-llenado |
| 3 | Completar: descripción, gravedad, responsable | Datos capturados |
| 4 | Guardar la Non-Conformance | NC creada y vinculada a la inspección |
| 5 | Verificar que la NC aparece en la lista | La NC está en la lista con estado "Open" |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-CAL-04: CAPA (Corrective and Preventive Actions)

**Objetivo:** Verificar el flujo completo de acciones correctivas/preventivas.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Desde una Non-Conformance, crear **Corrective Action** | Formulario de acción correctiva |
| 2 | Definir: acción, responsable, fecha límite | Datos configurados |
| 3 | Guardar y asignar | La acción se vincula a la NC |
| 4 | Crear también una **Preventive Action** | Acción preventiva creada |
| 5 | Marcar la Corrective Action como completada con evidencia | Estado: Completed |
| 6 | Verificar que la NC refleja las acciones completadas | Las acciones aparecen en la NC |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-CAL-05: Quality Feedback

**Objetivo:** Verificar la captura de retroalimentación de calidad.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear un **Quality Feedback** tipo "Queja" | Formulario abierto |
| 2 | Vincular a un artículo y proveedor | Datos vinculados |
| 3 | Describir la queja | Descripción capturada |
| 4 | Hacer clic en **Create Non-Conformance** (si es crítica) | NC creada desde el feedback |
| 5 | Verificar que la NC tiene referencia al feedback | La referencia existe |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-CAL-06: Quality Review

**Objetivo:** Verificar el registro de revisiones de calidad.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear un **Quality Review** | Formulario de revisión |
| 2 | Agregar participantes y hallazgos | Datos capturados |
| 3 | Definir acciones acordadas y fecha de seguimiento | Acciones registradas |
| 4 | Guardar la revisión | Revisión creada |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-CAL-07: Inspección por Lote (v16)

**Objetivo:** Verificar la inspección vinculada a lotes específicos.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Recibir material con lote que requiere inspección | Material recibido con lote |
| 2 | Crear inspección para el lote específico | La inspección se vincula al lote |
| 3 | Resultado: "Accepted" para el lote | El lote se marca como aceptado |
| 4 | Verificar que el lote puede usarse en producción/venta | El lote está disponible |
| 5 | Rechazar otro lote | El lote rechazado no está disponible |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-CAL-08: Reportes de Calidad

**Objetivo:** Verificar que los reportes de calidad funcionan.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Generar **Quality Inspection Summary** | Resumen de inspecciones correcto |
| 2 | Generar **Non-Conformance Analysis** | Análisis de tendencias correcto |
| 3 | Verificar filtros por período, artículo, proveedor | Los filtros funcionan |
| 4 | Verificar gráficas de tendencias | Las gráficas se renderizan |

**Resultado:** ☐ PASA / ☐ FALLA

---

*Guía del módulo de Calidad — Dossier de Migración ERPNext v13 → v16*
