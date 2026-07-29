# Guía de Migración: Módulo de Recursos Humanos (HR / HRMS)
## ERPNext v13 → v16

---

## Índice
1. [Resumen de Cambios](#1-resumen-de-cambios)
2. [Cambio Arquitectónico: Separación a App HRMS](#2-cambio-arquitectónico-separación-a-app-hrms)
3. [Nuevas Funcionalidades del HRMS](#3-nuevas-funcionalidades-del-hrms)
4. [Cambios Rompientes y Acciones Requeridas](#4-cambios-rompientes-y-acciones-requeridas)
5. [Cambios en la Interfaz de Usuario](#5-cambios-en-la-interfaz-de-usuario)
6. [Pruebas de Validación (UAT)](#6-pruebas-de-validación-uat)

---

## 1. Resumen de Cambios

> ⚠️ **CAMBIO CRÍTICO:** El módulo de Recursos Humanos fue completamente removido de ERPNext y convertido en una aplicación independiente llamada **Frappe HR (HRMS)**.

| Área | Cambio | Impacto |
|------|--------|---------|
| Arquitectura | **Módulo HR completamente separado** → app `hrms` | 🔴 Crítico |
| Instalación | Debe instalarse por separado con `bench get-app hrms` | 🔴 Crítico |
| Nómina | **Payroll Entry rediseñado** con componentes flexibles | 🟡 Medio |
| Self-Service | Portal de empleados renovado | 🟡 Medio |
| Asistencia | Nuevos doctypes de **Attendance Request** y **Shift Request** | 🟡 Medio |
| Vacaciones | **Leave Policy** mejorada, Compensatory Leave | 🟡 Medio |
| Separación | **Employee Separation** como doctype formal | 🟢 Bajo |
| Clasificación | **Employee Grade** y **Employee Group** nuevos | 🟢 Bajo |

---

## 2. Cambio Arquitectónico: Separación a App HRMS

### ¿Qué cambió?

A partir de ERPNext v14 comenzó la separación del módulo HR, y para v15/v16 es una app completamente independiente:

| Aspecto | v13 | v16 |
|---------|-----|-----|
| Ubicación del código | Dentro de ERPNext | App separada `hrms` |
| Instalación | Incluida por defecto | Requiere instalación manual |
| Versiones | Sigue la versión de ERPNext | Tiene su propio versionamiento |
| Actualizaciones | Se actualiza con ERPNext | Se actualiza por separado |
| Menú | Aparece en el Desk automáticamente | Solo aparece si la app está instalada |
| Base de datos | Misma BD, tablas incluidas | Misma BD, tablas creadas por la app |

### ¿Qué doctypes fueron movidos?

Todos los doctypes relacionados con HR ahora pertenecen a la app HRMS:

| Categoría | Doctypes |
|-----------|----------|
| **Empleados** | Employee, Employee Group, Employee Grade, Employee Skill, Employee Promotion, Employee Transfer, Employee Separation |
| **Asistencia** | Attendance, Attendance Request, Shift Type, Shift Assignment, Shift Request |
| **Vacaciones** | Leave Type, Leave Policy, Leave Allocation, Leave Application, Leave Encashment, Compensatory Leave Request |
| **Nómina** | Payroll Entry, Salary Structure, Salary Structure Assignment, Salary Slip, Salary Component, Additional Salary |
| **Impuestos** | Employee Tax Exemption Declaration, Employee Tax Exemption Proof Submission |
| **Gastos** | Expense Claim, Expense Claim Type |
| **Beneficios** | Employee Benefit Application, Employee Benefit Claim |
| **Capacitación** | Training Event, Training Result, Training Feedback |
| **Lifecycle** | Employee Onboarding, Employee Separation |

### ¿Qué permanece en ERPNext?

- El doctype **Employee** se mantiene como un doctype "compartido" (ERPNext lo necesita para referencias cruzadas)
- Las referencias a Employee en otros módulos (Contabilidad, Proyectos) siguen funcionando
- Los permisos de HR se definen en la app HRMS

### Proceso de instalación

```bash
# En el bench de v16:
bench get-app hrms --branch version-16
bench --site <sitename> install-app hrms
bench --site <sitename> migrate
bench restart
```

---

## 3. Nuevas Funcionalidades del HRMS

### 3.1 Employee Grade y Employee Group

**Employee Grade:**
- Nuevo doctype para clasificar empleados por nivel jerárquico
- Permite definir rangos salariales por grado
- Se vincula a la **Salary Structure** para asignación automática

**Employee Group:**
- Agrupaciones funcionales de empleados (ej: "Equipo de Ventas", "Producción Turno A")
- Permite asignar políticas y permisos por grupo

### 3.2 Attendance Request y Shift Request

**Attendance Request:**
- Los empleados pueden solicitar correcciones de asistencia
- Flujo de aprobación: Empleado → Supervisor → RRHH
- Incluye: fecha, razón, evidencia adjunta

**Shift Request:**
- Solicitud de cambio de turno por parte del empleado
- Se vincula a **Shift Type** (tipos de turno configurados)
- Aprobación por supervisor

### 3.3 Compensatory Leave (Permiso Compensatorio)

- Nuevo doctype para registrar permisos compensatorios por trabajo en días festivos/descanso
- Flujo: Empleado trabaja en día festivo → Solicita Compensatory Leave → Aprobación → Se acreditan días de descanso

### 3.4 Payroll Entry Rediseñado

- **Salary Components** (componentes salariales) más flexibles:
  - Percepciones y deducciones configurables con fórmulas
  - Soporte para variables (antigüedad, faltas, horas extra)
  - Componentes basados en porcentaje de otro componente
- **Salary Structure Assignment** como doctype separado para vincular estructura → empleado
- **Additional Salary** para pagos/deducciones extraordinarias
- Mejor manejo de impuestos con **Employee Tax Exemption**

### 3.5 Employee Self Service Portal

- Portal renovado donde los empleados pueden:
  - Ver sus recibos de nómina
  - Solicitar vacaciones
  - Solicitar cambios de turno
  - Ver su asistencia
  - Subir documentos
  - Ver sus beneficios

### 3.6 Employee Lifecycle (Ciclo de Vida)

Doctypes formales para cada etapa:
- **Employee Onboarding**: Checklist de tareas de ingreso
- **Employee Promotion**: Registro de promociones con cambio de grado/salario
- **Employee Transfer**: Transferencias entre departamentos/sucursales
- **Employee Separation**: Proceso de baja con checklist de salida

---

## 4. Cambios Rompientes y Acciones Requeridas

### 4.1 Instalación de la App HRMS

> 🔴 **Sin la app HRMS instalada, NINGUNA funcionalidad de RRHH estará disponible.**

| Acción | Descripción |
|--------|-------------|
| Instalar app | `bench get-app hrms` + `install-app hrms` |
| Ejecutar migraciones | Las migraciones de HRMS se ejecutan después de la instalación |
| Verificar datos | Todos los datos HR permanecen en la BD pero necesitan la app para ser accesibles |
| Verificar permisos | Los roles HR se definen en la app HRMS |

### 4.2 Custom Scripts y Reportes

| Aspecto | Impacto | Acción |
|---------|---------|--------|
| Client Scripts | Scripts en doctypes HR solo funcionan con HRMS instalado | Verificar y condicionar |
| Server Scripts | Scripts server que referencien doctypes HR | Envolver en try/except o verificar app |
| Custom Reports | Reportes que consulten tablas HR | Verificar que la app esté instalada antes de ejecutar |
| Print Formats | Formatos de impresión de recibos de nómina, etc. | Verificar compatibilidad con nuevos campos |
| Workflows | Flujos de trabajo configurados para Leave, Payroll, etc. | Revisar y actualizar |

### 4.3 Integración con Otros Módulos

- **Contabilidad**: Las entradas de nómina siguen creando GL Entries vía la app HRMS
- **Proyectos**: La referencia a Employee sigue funcionando
- **Gastos**: Expense Claim está en HRMS; si usan Expense Claim desde Cuentas por Pagar, verificar
- **Asset**: Asset Assignment a empleado sigue funcionando si Employee existe

### 4.4 Payroll Entry

- La estructura de nómina cambió significativamente
- **Salary Components** ahora permiten fórmulas Python
- Si tienen componentes personalizados, deben recrearlos en el nuevo formato
- Las **Salary Structures** existentes pueden requerir ajustes
- Las **Salary Structure Assignments** deben verificarse

---

## 5. Cambios en la Interfaz de Usuario

### 5.1 Workspace de RRHH
- Workspace dedicado con secciones: Empleados, Asistencia, Vacaciones, Nómina, Lifecycle
- Accesos directos a tareas frecuentes
- Dashboard con métricas clave (empleados activos, vacaciones pendientes, etc.)

### 5.2 Employee Master
- Formulario reorganizado con pestañas
- Nueva pestaña de "Employment Details" con grade, designation, department
- Historial de promociones y transferencias integrado
- Sección de documentos del empleado

### 5.3 Salary Slip (Recibo de Nómina)
- Vista mejorada con desglose de percepciones y deducciones
- Formato de impresión renovado
- Link directo al cálculo de impuestos

---

## 6. Pruebas de Validación (UAT)

> ⚠️ **Prerequisito:** La app HRMS debe estar instalada y configurada en el entorno de staging.

---

### UAT-RH-01: Verificar Instalación de HRMS

**Objetivo:** Confirmar que la app HRMS está correctamente instalada.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Verificar que el workspace de RRHH aparece en el sidebar | El menú RRHH es visible |
| 2 | Ir a **Employee** | La lista de empleados se carga |
| 3 | Verificar que los empleados existentes aparecen | Los datos se migraron correctamente |
| 4 | Ir a **Leave Type** | Los tipos de vacaciones existen |
| 5 | Ir a **Salary Structure** | Las estructuras salariales existen |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-RH-02: Alta de Empleado

**Objetivo:** Verificar el flujo de alta de un nuevo empleado.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Ir a **Employee → Nuevo** | Formulario de nuevo empleado |
| 2 | Llenar datos básicos (nombre, departamento, designación) | Datos capturados |
| 3 | Asignar **Employee Grade** | Grado asignado |
| 4 | Guardar el empleado | Empleado creado con ID |
| 5 | Crear un **Employee Onboarding** | Checklist de ingreso creado |
| 6 | Verificar que las tareas de onboarding aparecen | Lista de tareas visible |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-RH-03: Asistencia

**Objetivo:** Verificar el registro y consulta de asistencia.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear un registro de **Attendance** para un empleado | Asistencia registrada |
| 2 | Verificar que el estado (Present/Absent) se refleja | Estado correcto |
| 3 | Desde el portal del empleado, hacer un **Attendance Request** | Solicitud creada |
| 4 | Aprobar la solicitud como supervisor | Asistencia corregida |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-RH-04: Solicitud de Vacaciones

**Objetivo:** Verificar el flujo de solicitud y aprobación de vacaciones.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Configurar **Leave Policy** y **Leave Allocation** para un empleado | Días asignados |
| 2 | Crear una **Leave Application** | Solicitud creada |
| 3 | Verificar que el saldo de días disponibles es correcto | Saldo correcto |
| 4 | Aprobar la solicitud | Estado: Aprobado |
| 5 | Verificar que el saldo se redujo | Días descontados |
| 6 | Intentar solicitar más días de los disponibles | El sistema bloquea la solicitud |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-RH-05: Compensatory Leave

**Objetivo:** Verificar el flujo de permisos compensatorios.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Registrar asistencia de un empleado en un día festivo | Asistencia en festivo registrada |
| 2 | Crear una **Compensatory Leave Request** | Solicitud creada |
| 3 | Aprobar la solicitud | Se acreditan los días compensatorios |
| 4 | Verificar que el saldo de leave se incrementó | Saldo actualizado |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-RH-06: Nómina (Payroll Entry)

**Objetivo:** Verificar el flujo completo de nómina.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Configurar una **Salary Structure** con componentes | Estructura creada |
| 2 | Crear **Salary Structure Assignment** para un empleado | Asignación creada |
| 3 | Crear un **Payroll Entry** para el período | Entrada de nómina creada |
| 4 | Hacer clic en **Get Employees** | Los empleados se cargan |
| 5 | Hacer clic en **Create Salary Slips** | Los recibos se generan |
| 6 | Verificar un **Salary Slip** individualmente | Percepciones y deducciones correctas |
| 7 | Enviar la Payroll Entry | Los recibos se marcan como enviados |
| 8 | Hacer clic en **Make Bank Entry** o **Make Payment Entry** | Se genera el asiento contable |
| 9 | Verificar en el Libro Mayor | Los asientos de nómina existen |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-RH-07: Salary Components con Fórmulas

**Objetivo:** Verificar que los componentes salariales con fórmulas calculan correctamente.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear un **Salary Component** con fórmula (ej: ISR basado en salario) | Componente creado |
| 2 | Incluirlo en una Salary Structure | Componente vinculado |
| 3 | Generar un Salary Slip para un empleado | Recibo generado |
| 4 | Verificar que la fórmula calculó correctamente | El monto es el esperado según la fórmula |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-RH-08: Employee Lifecycle (Promoción y Separación)

**Objetivo:** Verificar los procesos de ciclo de vida del empleado.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear una **Employee Promotion** | Formulario con cambios de grado/salario |
| 2 | Aprobar la promoción | El empleado cambia de grado |
| 3 | Verificar el historial del empleado | La promoción aparece en el historial |
| 4 | Crear una **Employee Separation** | Checklist de salida creado |
| 5 | Completar las tareas de separación | Tareas marcadas como completadas |
| 6 | Verificar que el estado del empleado cambia a "Left" | Estado actualizado |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-RH-09: Shift Management (Gestión de Turnos)

**Objetivo:** Verificar la gestión de turnos de trabajo.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear un **Shift Type** (ej: "Turno Matutino 7:00-15:00") | Turno creado |
| 2 | Crear **Shift Assignment** para un empleado | Turno asignado |
| 3 | Crear una **Shift Request** (cambio de turno) | Solicitud creada |
| 4 | Aprobar la solicitud | El turno del empleado cambia |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-RH-10: Expense Claim (Gastos)

**Objetivo:** Verificar el flujo de solicitud de reembolso de gastos.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear un **Expense Claim** para un empleado | Formulario abierto |
| 2 | Agregar gastos con montos y comprobantes | Gastos registrados |
| 3 | Enviar para aprobación | Estado: Pendiente de aprobación |
| 4 | Aprobar el Expense Claim | Estado: Aprobado |
| 5 | Crear el pago de reembolso | El pago se vincula al Expense Claim |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-RH-11: Reportes de RRHH

**Objetivo:** Verificar que los reportes principales de RRHH funcionan.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Generar reporte de **Employee Information** | Datos correctos |
| 2 | Generar **Monthly Attendance Sheet** | Hoja de asistencia correcta |
| 3 | Generar **Leave Balance** | Saldos de vacaciones correctos |
| 4 | Generar **Salary Register** | Detalle de nómina correcto |
| 5 | Generar **Employee Birthday** | Lista de cumpleaños |

**Resultado:** ☐ PASA / ☐ FALLA

---

*Guía del módulo de Recursos Humanos — Dossier de Migración ERPNext v13 → v16*
