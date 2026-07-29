# Guía de Migración: Módulo de Mantenimiento (Asset Maintenance)
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

> ⚠️ **CAMBIO ESTRUCTURAL:** El módulo de Mantenimiento fue fusionado con el módulo de Assets (Activos Fijos) en v16. Los doctypes independientes de mantenimiento fueron integrados como parte del doctype Asset.

| Área | Cambio | Impacto |
|------|--------|---------|
| Arquitectura | **Módulo fusionado con Assets** (v16) | 🔴 Alto |
| Workspace | Workspace "Maintenance" eliminado | 🟡 Medio |
| Doctypes | Doctypes de mantenimiento → child tables del Asset | 🔴 Alto |
| Asset Repair | **Asset Repair** como doctype formal (v14) | 🟡 Medio |
| Asset Movement | Movimiento de activos entre ubicaciones/CC (v14) | 🟡 Medio |
| Programación | Programación de mantenimiento mejorada | 🟢 Bajo |
| Depreciación | Depreciación diaria de activos (v15) | 🟡 Medio |

---

## 2. Cambios Detallados por Versión

### 2.1 Cambios en v14 (desde v13)

#### a) Asset Repair
- Nuevo doctype para registrar reparaciones de activos
- Campos: Activo, Descripción del fallo, Costo de reparación, Proveedor de servicio, Fecha
- Se vincula al activo y al historial de mantenimiento
- Los costos de reparación pueden registrarse contablemente

#### b) Asset Movement
- Nuevo doctype para transferir activos entre:
  - Ubicaciones (almacenes)
  - Centros de costo
  - Departamentos
  - Custodios (empleados)
- Registro formal de cada movimiento con fecha y responsable
- Historial de ubicaciones del activo

#### c) Maintenance Schedule Mejorado
- Programación de tareas periódicas basadas en calendario
- Configuración de frecuencia: diaria, semanal, mensual, trimestral, anual
- Generación automática de tareas de mantenimiento según el programa
- Notificaciones de tareas próximas

#### d) Downtime Entry (vinculado)
- El **Downtime Entry** del módulo de Manufactura se puede vincular al activo
- Permite correlacionar tiempos muertos de producción con el activo afectado

### 2.2 Cambios en v15 (desde v14)

#### a) Depreciación Diaria de Activos
- La depreciación ahora se calcula de forma **diaria** en lugar de mensual
- Distribución más justa y precisa del valor de depreciación
- El schedule de depreciación se separó del registro de activo como un doctype vinculado

#### b) Asset Capitalization
- Mejoras en el proceso de capitalización de activos
- Soporte para capitalización de gastos acumulados
- Conversión de artículos de stock a activos fijos

#### c) Maintenance Visit
- Doctype para registrar visitas de mantenimiento preventivo o correctivo
- Se puede vincular a un contrato de servicio
- Registro de actividades realizadas durante la visita

### 2.3 Cambios en v16 (desde v15)

#### a) Fusión del Módulo de Mantenimiento con Assets ⭐⭐

> ⚠️ **Cambio arquitectónico mayor**

El módulo de Mantenimiento como entidad separada fue eliminado. Todas las funcionalidades de mantenimiento se integraron en el doctype **Asset** bajo el módulo de **Fixed Assets** (Activos Fijos).

**Doctypes afectados:**

| Doctype v13 | Estado en v16 | Nuevo Ubicación |
|-------------|--------------|-----------------|
| Asset Maintenance Team | ❌ Removido como doctype independiente | Campo "Maintenance Team" dentro del Asset |
| Asset Maintenance Log | ❌ Removido como doctype independiente | Child table `maintenance_log` dentro del Asset |
| Asset Maintenance Schedule | ❌ Removido como doctype independiente | Child table `asset_maintenance_schedule` dentro del Asset |
| Asset Maintenance Task | ❌ Removido como doctype independiente | Integrado en la schedule del Asset |
| Asset Movement | ✅ Permanece | Doctype vinculado al Asset |
| Asset Repair | ✅ Permanece | Doctype vinculado al Asset, accesible desde el Asset |

**Flujo anterior (v13):**
```
Módulo: Maintenance
  → Asset Maintenance Team (configurar equipo)
  → Asset Maintenance Schedule (crear programa)
  → Asset Maintenance Task (tareas generadas)
  → Asset Maintenance Log (registrar ejecución)
```

**Flujo nuevo (v16):**
```
Módulo: Assets (Activos Fijos)
  → Asset (abrir el activo)
    → Pestaña "Maintenance" 
      → Equipo de mantenimiento (campo)
      → Programa de mantenimiento (child table)
      → Historial de mantenimiento (child table)
    → Botón "Create" → Asset Repair
    → Botón "Create" → Asset Movement
```

#### b) Asset Maintenance History Report
- Nuevo reporte que muestra el historial completo de mantenimiento de un activo
- Incluye: mantenimientos programados, completados, pendientes, reparaciones

#### c) Asset Downtime Report
- Reporte de tiempos muertos vinculados a activos
- Correlación con costos de reparación y mantenimiento

#### d) Maintenance Cost Analysis
- Nuevo reporte que analiza costos de mantenimiento por activo, categoría, período
- Permite identificar activos con costos de mantenimiento elevados

---

## 3. Nuevas Funcionalidades

### 3.1 Gestión de Mantenimiento desde el Asset (v16)

**Cómo acceder:**
1. Ir a **Activos Fijos → Asset** → seleccionar el activo
2. Ir a la pestaña **"Maintenance"**
3. En esta pestaña se encuentran:
   - **Equipo de mantenimiento**: Campo para asignar al equipo responsable
   - **Programa de mantenimiento**: Tabla con tareas programadas (frecuencia, próxima fecha, responsable)
   - **Historial de mantenimiento**: Tabla con registros de mantenimientos realizados

**Programar mantenimiento preventivo:**
1. En la tabla de programa, agregar una fila
2. Definir: Tarea, Frecuencia, Responsable, Próxima fecha
3. El sistema genera alertas automáticas cuando la tarea está próxima
4. Al completar la tarea, se registra en el historial

### 3.2 Asset Repair

**Cómo usar:**
1. Desde el **Asset**, hacer clic en **Create → Asset Repair**
2. Llenar: Descripción del fallo, Proveedor de servicio, Costo estimado
3. Al completar la reparación: Costo real, Fecha de finalización, Descripción del trabajo realizado
4. El costo de reparación se registra contablemente si se configura

### 3.3 Asset Movement

**Cómo usar:**
1. Desde el **Asset**, hacer clic en **Create → Asset Movement**
2. Definir:
   - Tipo de movimiento: Transferencia, Emisión, Recepción
   - Ubicación destino / Centro de costo / Departamento / Custodio
3. Enviar el movimiento → el activo se actualiza con la nueva ubicación
4. El historial de movimientos se registra

---

## 4. Cambios Rompientes y Acciones Requeridas

### 4.1 Doctypes Removidos

> 🔴 **Todos los scripts, reportes y botones personalizados que referencien los doctypes removidos fallarán.**

| Doctype Removido | Acción Requerida |
|-----------------|-----------------|
| `Asset Maintenance Team` | Actualizar scripts para usar el campo dentro del Asset |
| `Asset Maintenance Log` | Actualizar scripts para usar la child table del Asset |
| `Asset Maintenance Schedule` | Actualizar scripts para usar la child table del Asset |
| `Asset Maintenance Task` | Actualizar scripts para usar el programa dentro del Asset |

### 4.2 Navegación

| Aspecto | Antes (v13) | Después (v16) |
|---------|-------------|---------------|
| Acceso | Workspace "Maintenance" dedicado | Workspace "Assets" → pestaña Maintenance en el Asset |
| Listado | Lista de Maintenance Schedules separada | No hay lista separada; se accede desde cada Asset |
| Búsqueda | Buscar "Asset Maintenance" | Buscar "Asset" y navegar a la pestaña |

**Acción:** Capacitar a los usuarios para que accedan al mantenimiento desde la ficha del activo.

### 4.3 Migración de Datos

- Durante la migración a v16, un **patch** copia los datos de los doctypes independientes a las child tables del Asset
- **Es crucial verificar** que la migración de datos fue completa:
  - Contar registros antes y después
  - Verificar que no se perdieron programas ni logs
  - Validar que las vinculaciones a activos son correctas

### 4.4 Reportes Personalizados

- Reportes que consultaban los doctypes removidos deben reescribirse
- Las nuevas consultas deben apuntar a las child tables del Asset

---

## 5. Cambios en la Interfaz de Usuario

### 5.1 Asset con Pestaña de Mantenimiento
- El formulario del **Asset** ahora tiene una pestaña dedicada "Maintenance"
- Vista de timeline con mantenimientos programados y completados
- Indicadores visuales: próximo mantenimiento, mantenimiento vencido
- Botones de acción: Create Repair, Create Movement

### 5.2 Calendar View
- Vista de calendario disponible desde el dashboard del Asset
- Muestra los mantenimientos programados para todos los activos

### 5.3 Dashboard de Assets
- Métricas de mantenimiento integradas en el dashboard de activos:
  - Mantenimientos pendientes
  - Mantenimientos vencidos
  - Costo total de mantenimiento
  - Activos con mayor costo de mantenimiento

---

## 6. Pruebas de Validación (UAT)

---

### UAT-MNT-01: Verificar Migración de Datos de Mantenimiento

**Objetivo:** Confirmar que los datos de mantenimiento se migraron correctamente al Asset.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Abrir un **Asset** que tenía mantenimiento programado en v13 | El Asset se carga |
| 2 | Ir a la pestaña **Maintenance** | La pestaña existe y es accesible |
| 3 | Verificar que el programa de mantenimiento se migró | Las tareas programadas aparecen |
| 4 | Verificar que el historial de mantenimiento se migró | Los logs históricos aparecen |
| 5 | Verificar que el equipo de mantenimiento está asignado | El equipo aparece |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-MNT-02: Programar Mantenimiento Preventivo

**Objetivo:** Verificar la programación de mantenimiento desde el Asset.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Abrir un **Asset** → pestaña Maintenance | Pestaña visible |
| 2 | Agregar una tarea de mantenimiento: "Lubricación mensual" | Tarea agregada |
| 3 | Configurar frecuencia: Mensual | Frecuencia configurada |
| 4 | Asignar responsable y próxima fecha | Datos configurados |
| 5 | Guardar el Asset | Programa guardado |
| 6 | Verificar que la tarea aparece en el calendario | La tarea se muestra |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-MNT-03: Registrar Mantenimiento Completado

**Objetivo:** Verificar el registro de un mantenimiento realizado.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Abrir un Asset con mantenimiento programado | Asset abierto |
| 2 | Marcar una tarea programada como **completada** | La tarea se registra en el historial |
| 3 | Agregar observaciones del mantenimiento | Observaciones guardadas |
| 4 | Verificar que la próxima fecha se actualizó automáticamente | La siguiente fecha se calculó según la frecuencia |
| 5 | Verificar el historial de mantenimiento | El registro aparece en el log |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-MNT-04: Asset Repair

**Objetivo:** Verificar el registro de reparaciones de activos.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Desde un **Asset**, hacer clic en **Create → Asset Repair** | Formulario de reparación abierto |
| 2 | Describir el fallo y el proveedor de servicio | Datos capturados |
| 3 | Ingresar costo estimado | Costo registrado |
| 4 | Enviar la orden de reparación | Reparación creada |
| 5 | Completar la reparación: costo real, descripción del trabajo | Datos finales capturados |
| 6 | Verificar que el costo se refleja en el Asset | El historial de reparaciones muestra el costo |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-MNT-05: Asset Movement

**Objetivo:** Verificar la transferencia de activos entre ubicaciones.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Desde un Asset, hacer clic en **Create → Asset Movement** | Formulario de movimiento |
| 2 | Definir tipo de movimiento y ubicación destino | Datos configurados |
| 3 | Enviar el movimiento | El activo se actualiza con nueva ubicación |
| 4 | Verificar la ubicación actual del Asset | La ubicación cambió |
| 5 | Verificar el historial de movimientos | El movimiento se registró |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-MNT-06: Asset Depreciation (Depreciación Diaria - v15+)

**Objetivo:** Verificar que la depreciación de activos se calcula correctamente.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear un Asset con valor y método de depreciación | Asset creado |
| 2 | Verificar el **Depreciation Schedule** | El programa muestra depreciación diaria/mensual |
| 3 | Procesar la depreciación para un período | Los asientos GL se crean |
| 4 | Verificar que la depreciación es proporcional al número de días | Distribución diaria correcta |
| 5 | Verificar el valor neto del activo | Valor = Valor original - Depreciación acumulada |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-MNT-07: Reportes de Mantenimiento y Activos

**Objetivo:** Verificar que los reportes funcionan correctamente.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Generar **Asset Maintenance History** | Historial por activo correcto |
| 2 | Generar **Asset Downtime Report** | Tiempos muertos listados |
| 3 | Generar **Maintenance Cost Analysis** | Costos por activo/período correctos |
| 4 | Generar **Fixed Asset Register** | Registro de activos fijos correcto |
| 5 | Generar **Asset Depreciation Ledger** | Ledger de depreciación correcto |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-MNT-08: Navegación al Mantenimiento

**Objetivo:** Verificar que los usuarios pueden encontrar las funciones de mantenimiento.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Buscar "Maintenance" en la barra de búsqueda | Se muestran resultados relevantes (Assets) |
| 2 | Ir al workspace de **Assets** | El workspace se carga con sección de mantenimiento |
| 3 | Desde la lista de Assets, abrir uno y ir a pestaña Maintenance | La pestaña es accesible |
| 4 | Verificar que los botones de Create (Repair, Movement) funcionan | Los formularios se abren correctamente |

**Resultado:** ☐ PASA / ☐ FALLA

---

*Guía del módulo de Mantenimiento — Dossier de Migración ERPNext v13 → v16*
