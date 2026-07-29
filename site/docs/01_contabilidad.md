# Guía de Migración: Módulo de Contabilidad (Accounts)
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

El módulo de Contabilidad es uno de los que más cambios experimentó entre v13 y v16. Los cambios más importantes son:

| Área | Cambio | Impacto |
|------|--------|---------|
| Pagos | Nuevo doctype **Payment** unifica pagos de clientes y proveedores | 🔴 Alto |
| Cobranza | Nuevo sistema de **Dunning** (gestión de morosos) | 🟡 Medio |
| Retenciones | **Tax Withholding Category** reemplaza configuración anterior | 🔴 Alto |
| Conciliación | Conciliación bancaria completamente rediseñada | 🟡 Medio |
| Ingresos/Gastos diferidos | **Process Deferred Accounting** automatiza el registro | 🟢 Bajo |
| Dimensiones | Dimensiones contables pueden ser obligatorias | 🟡 Medio |
| Presupuestos | Budget rediseñado con distribución mensual y varianzas | 🟡 Medio |
| Reportes financieros | Financial Report Templates personalizables (v16) | 🟡 Medio |
| Payment Ledger | Nuevo ledger inmutable para pagos (v14) | 🟡 Medio |

---

## 2. Cambios Detallados por Versión

### 2.1 Cambios en v14 (desde v13)

#### a) Payment Ledger (Ledger de Pagos Inmutable)
- Se introdujo un nuevo **Payment Ledger Entry** que separa el registro de pagos del GL Entry
- **Propósito:** Mejorar el rendimiento y la integridad de la conciliación de pagos
- **Impacto para el usuario:** Transparente en operaciones diarias, pero afecta reportes personalizados que consultaban GL Entry directamente para pagos

#### b) Dunning (Gestión de Cobranza)
- Nuevo doctype **Dunning** para gestionar facturas vencidas
- Permite crear **Dunning Letters** (cartas de cobro) con plantillas
- Flujo: Facturas vencidas → Lista de Dunning → Generar carta → Enviar por email
- Incluye configuración de niveles de Dunning (1er aviso, 2do aviso, etc.)

#### c) Contabilidad de Descuentos
- Soporte para **descuentos comerciales y no comerciales** en Facturas de Venta
- Los descuentos pueden registrarse en cuentas contables separadas (Discount Accounting)

#### d) Contabilidad Provisional para Gastos
- Permite registrar gastos provisionalmente antes de recibir la factura del proveedor
- Útil para acumular costos al cierre de período

#### e) Dimensiones Contables Mejoradas
- Las dimensiones contables (Centro de Costo, Proyecto, etc.) pueden hacerse **obligatorias** para tipos de transacción específicos
- Configuración en: Accounting Settings → Mandatory Accounting Dimensions

#### f) Asignación de Centro de Costo Configurable
- Nuevo doctype **Cost Center Allocation** para distribuir automáticamente gastos/ingresos entre múltiples centros de costo

#### g) Mejoras en Conciliación Bancaria
- UI rediseñada con panel dividido (extracto bancario + libro mayor)
- Soporte para importación de estados de cuenta bancarios

#### h) Common Party Accounting
- Permite que un mismo tercero sea Cliente y Proveedor, con contabilidad cruzada

### 2.2 Cambios en v15 (desde v14)

#### a) Account Closing Balance (Saldo de Cierre de Cuenta)
- Nuevo doctype que almacena saldos de cierre para mejorar el rendimiento de reportes
- **Impacto:** Los reportes financieros (Balance General, Estado de Resultados) cargan significativamente más rápido

#### b) Facturas Editables Post-Envío
- Las facturas de venta y compra ahora pueden editarse después de ser enviadas (submitted)
- Campos editables: Cuentas contables, Centro de Costo, Proyecto
- **Ya no es necesario cancelar y enmendar** para corregir errores menores
- ⚠️ Los campos de monto y artículos **no** son editables post-envío

#### c) Tax Withholding Category (Categoría de Retención Fiscal)
- Nuevo doctype maestro para definir reglas de retención fiscal
- **Reemplaza** la configuración anterior de retenciones directamente en el registro de Proveedor/Cliente
- Se vincula al Proveedor/Cliente, y el sistema calcula y aplica automáticamente la retención al enviar la factura
- Soporta umbrales, tasas escalonadas y fechas de vigencia

#### d) Bank Statement Transaction
- Nuevo doctype para almacenar transacciones importadas del banco
- Soporta importación CSV y conexión con servicios bancarios
- Parte del nuevo flujo de conciliación bancaria

#### e) Conciliación de Pagos Mejorada
- El proceso de conciliación ahora se ejecuta en **segundo plano** para manejar grandes volúmenes
- Nuevo asistente de conciliación automática basado en reglas de tolerancia
- Puede coincidir automáticamente múltiples facturas con un solo pago

#### f) Reportes Financieros Mejorados
- Nuevo reporte **Financial Ratios** (razones financieras)
- Mayor velocidad en generación de reportes financieros gracias a Account Closing Balance

### 2.3 Cambios en v16 (desde v15)

#### a) Doctype Payment (Pagos Unificados) ⭐
- Nuevo doctype **Payment** que unifica el registro de pagos de clientes y proveedores
- **Reemplaza funcionalmente** a Payment Entry y Journal Entry para transacciones de pago estándar
- Interfaz simplificada: seleccionar cliente/proveedor → el sistema muestra facturas pendientes → registrar pago → conciliar automáticamente
- Payment Entry y Journal Entry siguen existiendo para retrocompatibilidad, pero están ocultos de los menús por defecto

#### b) Financial Report Templates (Plantillas de Reportes Financieros)
- Nuevas plantillas personalizables con fórmulas para Estado de Resultados y Balance General
- Permiten crear formatos regionales o conforme a IFRS sin código personalizado
- Los usuarios pueden definir filas, agrupaciones y fórmulas de cálculo

#### c) Consolidated Trial Balance
- Nuevo reporte que muestra un Balance de Comprobación unificado para empresas subsidiarias
- Incluye conversión automática de monedas

#### d) Purchase Expense Booking
- Simplifica el registro de costos ocultos en compras (fletes, seguros, aranceles)
- Facilita el cálculo del Costo de Bienes Vendidos (COGS)

#### e) Cierre Automático de Inventario
- Automatiza el registro de saldos de inventario en el libro mayor al cierre de mes
- Reduce el trabajo manual de cierre contable

#### f) Budget Rediseñado
- Soporte para distribución presupuestaria mensual por cuenta
- Reporte de varianza presupuestaria con análisis de desviaciones
- Alertas configurables cuando el gasto supera el presupuesto

---

## 3. Nuevas Funcionalidades

### 3.1 Dunning (Gestión de Morosos)

**¿Qué es?** Un sistema completo para gestionar facturas vencidas y enviar recordatorios de cobro.

**Cómo usarlo:**
1. Ir a **Contabilidad → Dunning**
2. El sistema muestra todas las facturas vencidas agrupadas por cliente
3. Seleccionar las facturas y hacer clic en **Crear Dunning Letter**
4. Personalizar la carta con la plantilla configurada
5. Enviar por email directamente desde el sistema

**Configuración necesaria:**
- Crear **Dunning Type** con niveles (1er aviso, 2do aviso, aviso legal)
- Configurar plantillas de email para cada nivel
- Definir días de gracia y recargos por morosidad

### 3.2 Payment (Pagos Unificados)

**¿Qué es?** Un documento único para registrar cualquier tipo de pago (cobro a cliente, pago a proveedor, transferencias).

**Cómo usarlo:**
1. Ir a **Contabilidad → Payment** → Nuevo
2. Seleccionar tipo: Recibir (cobro) o Pagar (pago a proveedor)
3. Seleccionar el cliente o proveedor
4. El sistema muestra automáticamente las facturas pendientes
5. Ingresar el monto recibido/pagado
6. El sistema concilia automáticamente con las facturas seleccionadas
7. Enviar (submit) para registrar en el libro mayor

### 3.3 Financial Report Templates

**¿Qué es?** Plantillas de reportes financieros personalizables sin necesidad de programación.

**Cómo usarlo:**
1. Ir a **Contabilidad → Financial Report Template** → Nuevo
2. Definir filas con cuentas contables o grupos
3. Agregar fórmulas (suma, resta, porcentaje)
4. Guardar y usar como plantilla al generar Estado de Resultados o Balance General
5. Se puede crear una plantilla para cada formato requerido (local, IFRS, gestión interna)

### 3.4 Tax Withholding Category

**¿Qué es?** Un maestro para definir reglas de retención fiscal que se aplican automáticamente.

**Cómo configurarlo:**
1. Ir a **Contabilidad → Tax Withholding Category** → Nuevo
2. Definir nombre (ej: "ISR Retención 10%")
3. Agregar detalles: tasa, umbral mínimo, fecha de vigencia, cuenta contable de retención
4. Vincular al Proveedor o Cliente en su ficha maestra
5. Al crear una factura de compra, el sistema calculará y aplicará la retención automáticamente

---

## 4. Cambios Rompientes y Acciones Requeridas

### 4.1 Tax Withholding (Retención Fiscal)

| Aspecto | Antes (v13) | Después (v15+) |
|---------|-------------|----------------|
| Configuración | Tabla de tasas directamente en el registro de Proveedor/Cliente | Doctype separado **Tax Withholding Category** |
| Cálculo | Manual o por script personalizado | Automático al enviar factura |
| Acción requerida | - | Crear las categorías, vincularlas a proveedores/clientes |

⚠️ **Acción:** Si tienen scripts personalizados que escriben en la tabla `tax_withholding_rates` del Proveedor, deben actualizarlos para usar el nuevo doctype.

### 4.2 Payment Entry → Payment

| Aspecto | Antes (v13) | Después (v16) |
|---------|-------------|---------------|
| Doctype de pagos | Payment Entry + Journal Entry | **Payment** (nuevo) |
| Disponibilidad | Payment Entry es el doctype principal | Payment Entry sigue existiendo pero está oculto del menú |
| Acción requerida | - | Capacitar usuarios en el nuevo flujo de Payment |

⚠️ **Acción:** Si tienen scripts personalizados o integraciones que crean Payment Entry directamente (vía API), deben actualizarlos para usar el doctype `Payment`.

### 4.3 Dimensiones Contables Obligatorias

Si habilitan dimensiones contables como obligatorias:
- Las transacciones existentes que no tengan valor en la dimensión no podrán ser modificadas
- Deben asegurarse de llenar las dimensiones en todos los registros antes de activar esta configuración

### 4.4 Deferred Accounting

- Si previamente usaban entradas manuales de diario para contabilidad diferida, deben migrar al sistema de **Process Deferred Accounting**
- Las facturas con artículos diferidos deben tener configuradas las fechas de inicio y fin del diferimiento

---

## 5. Cambios en la Interfaz de Usuario

### 5.1 Navegación
- El módulo de Contabilidad tiene un nuevo **Workspace** con accesos directos a todas las funcionalidades
- Barra lateral con secciones: Facturación, Pagos, Bancos, Reportes, Maestros, Configuración

### 5.2 Libro Mayor (General Ledger)
- Ahora ofrece vista de árbol con cuentas expandibles
- Filtros mejorados por dimensión, período, y tipo de cuenta

### 5.3 Catálogo de Cuentas (Chart of Accounts)
- Renderizado como árbol interactivo
- Soporte para arrastrar y soltar para reorganizar cuentas (v14+)

### 5.4 Conciliación Bancaria
- Interfaz moderna de panel dividido
- Lado izquierdo: transacciones del banco importadas
- Lado derecho: asientos del libro mayor
- Coincidencia automática y manual entre ambos lados

### 5.5 Facturas
- Facturas de venta y compra ahora tienen **pestañas** (tabs) en lugar de una página larga
- Campos editables post-envío marcados con indicador visual

---

## 6. Pruebas de Validación (UAT)

### Instrucciones Generales
- Ejecutar cada prueba en el **entorno de staging** (nunca en producción)
- Registrar el resultado en la [Plantilla de Feedback](./plantilla_feedback.md)
- Si una prueba falla, documentar el error con captura de pantalla

---

### UAT-CONT-01: Crear Factura de Venta Estándar

**Objetivo:** Verificar que el flujo completo de facturación funciona correctamente.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Ir a **Contabilidad → Factura de Venta → Nueva** | Se abre el formulario de factura |
| 2 | Seleccionar un Cliente existente | Los datos del cliente se llenan automáticamente |
| 3 | Agregar un artículo con cantidad y precio | Se calcula el total |
| 4 | Verificar que los impuestos se apliquen según la plantilla | Los impuestos aparecen correctamente |
| 5 | Enviar (Submit) la factura | La factura cambia a estado "Enviado" |
| 6 | Verificar en el **Libro Mayor** que se crearon los asientos | Los asientos GL existen con las cuentas correctas |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-CONT-02: Registrar Pago de Cliente (Nuevo Doctype Payment)

**Objetivo:** Verificar el funcionamiento del nuevo doctype de pagos unificados.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Ir a **Contabilidad → Payment → Nuevo** | Se abre el formulario de Payment |
| 2 | Seleccionar tipo: **Recibir** | El formulario muestra campos de cobro |
| 3 | Seleccionar el Cliente | Se cargan las facturas pendientes de pago |
| 4 | Seleccionar la factura creada en UAT-CONT-01 | El monto se pre-llena con el saldo pendiente |
| 5 | Seleccionar cuenta de banco/caja | La cuenta se vincula al pago |
| 6 | Enviar (Submit) el pago | El pago se registra y la factura se marca como pagada |
| 7 | Verificar en el **Libro Mayor** | Los asientos de cobro existen correctamente |
| 8 | Verificar que la factura muestra saldo = 0 | El estado cambia a "Pagado" |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-CONT-03: Registrar Pago a Proveedor (Nuevo Doctype Payment)

**Objetivo:** Verificar pagos a proveedores con el nuevo sistema.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear una **Factura de Compra** estándar y enviarla | Factura creada correctamente |
| 2 | Ir a **Payment → Nuevo** | Se abre el formulario |
| 3 | Seleccionar tipo: **Pagar** | El formulario muestra campos de pago |
| 4 | Seleccionar el Proveedor | Se cargan las facturas pendientes |
| 5 | Seleccionar la factura y enviar el pago | El pago se registra, factura se marca como pagada |
| 6 | Verificar en el Libro Mayor | Asientos correctos |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-CONT-04: Dunning (Gestión de Cobranza)

**Objetivo:** Verificar el flujo completo de Dunning.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear una Factura de Venta con fecha de vencimiento pasada | Factura aparece como vencida |
| 2 | Ir a **Contabilidad → Dunning** | La factura vencida aparece en la lista |
| 3 | Crear un **Dunning** para esa factura | Se genera el documento de Dunning |
| 4 | Generar la carta de cobro | Se crea el PDF con los datos correctos |
| 5 | Verificar que se puede enviar por email | El botón de envío funciona correctamente |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-CONT-05: Tax Withholding Category (Retención Fiscal)

**Objetivo:** Verificar que las retenciones fiscales se aplican automáticamente.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear una **Tax Withholding Category** (ej: "ISR 10%") | Categoría creada con tasa, umbral y cuenta contable |
| 2 | Vincular la categoría a un Proveedor | El campo aparece en la ficha del proveedor |
| 3 | Crear una Factura de Compra para ese proveedor | Los artículos se agregan normalmente |
| 4 | Verificar que la retención se calcula automáticamente | El monto de retención aparece en los impuestos |
| 5 | Enviar la factura y verificar en el Libro Mayor | Los asientos incluyen la cuenta de retención |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-CONT-06: Conciliación Bancaria

**Objetivo:** Verificar el nuevo flujo de conciliación bancaria.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Ir a **Contabilidad → Bank Reconciliation** | Se abre la nueva interfaz de conciliación |
| 2 | Importar un estado de cuenta bancario (CSV) | Las transacciones se importan correctamente |
| 3 | Verificar que el sistema sugiere coincidencias | Se muestran sugerencias automáticas |
| 4 | Aceptar una coincidencia automática | La transacción se concilia |
| 5 | Conciliar manualmente una transacción | Se puede vincular manualmente |
| 6 | Verificar el estado de conciliación | Las transacciones conciliadas se marcan correctamente |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-CONT-07: Editar Factura Post-Envío

**Objetivo:** Verificar que se pueden editar ciertos campos de facturas enviadas.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Abrir una Factura de Venta enviada (submitted) | Se muestra la factura en modo lectura |
| 2 | Hacer clic en **Amend/Editar** en el campo de Centro de Costo | El campo se vuelve editable |
| 3 | Cambiar el Centro de Costo | El nuevo valor se guarda |
| 4 | Verificar que los campos de monto **no** son editables | Los campos de monto están protegidos |
| 5 | Verificar en el Libro Mayor que el cambio se refleja | El asiento GL tiene el nuevo Centro de Costo |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-CONT-08: Dimensiones Contables Obligatorias

**Objetivo:** Verificar que las dimensiones obligatorias funcionan correctamente.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Ir a **Accounting Settings** → configurar una dimensión como obligatoria | Configuración guardada |
| 2 | Crear una Factura de Venta **sin** la dimensión | El sistema muestra un error de validación |
| 3 | Agregar la dimensión y enviar | La factura se envía correctamente |
| 4 | Verificar que el reporte de Libro Mayor filtra por dimensión | El filtro funciona correctamente |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-CONT-09: Financial Report Templates (v16)

**Objetivo:** Verificar las plantillas de reportes financieros personalizables.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Ir a **Financial Report Template → Nuevo** | Se abre el constructor de plantilla |
| 2 | Definir filas con grupos de cuentas | Las cuentas se agregan correctamente |
| 3 | Agregar fórmulas de totalización | Las fórmulas se configuran |
| 4 | Guardar la plantilla | Se guarda exitosamente |
| 5 | Generar un Estado de Resultados usando la plantilla | El reporte muestra los datos según la plantilla definida |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-CONT-10: Consolidated Trial Balance (v16)

**Objetivo:** Verificar el reporte de Balance de Comprobación Consolidado.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Ir a **Reportes → Consolidated Trial Balance** | Se abre el reporte |
| 2 | Seleccionar la(s) empresa(s) | Los filtros permiten seleccionar múltiples empresas |
| 3 | Generar el reporte | Se muestra el balance consolidado con conversión de moneda |
| 4 | Verificar que los saldos son correctos | Los totales coinciden con los balances individuales |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-CONT-11: Deferred Accounting (Contabilidad Diferida)

**Objetivo:** Verificar el proceso automatizado de ingresos/gastos diferidos.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear un artículo con **Enable Deferred Revenue** | Artículo configurado |
| 2 | Crear una Factura de Venta con ese artículo | Los campos de fecha inicio/fin de diferimiento aparecen |
| 3 | Configurar las fechas de diferimiento (3 meses) | Fechas configuradas |
| 4 | Enviar la factura | Factura enviada correctamente |
| 5 | Ejecutar **Process Deferred Accounting** | Las entradas de diario diferidas se crean automáticamente |
| 6 | Verificar que se distribuyó el ingreso en 3 meses | Los asientos GL muestran la distribución correcta |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-CONT-12: Period Closing Voucher (Cierre de Período)

**Objetivo:** Verificar el cierre contable de período.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Ir a **Period Closing Voucher → Nuevo** | Se abre el formulario |
| 2 | Seleccionar el período de cierre y la cuenta de cierre | Datos configurados |
| 3 | Enviar el voucher | Se crean los asientos de cierre |
| 4 | Intentar crear una transacción en el período cerrado | El sistema bloquea la transacción con un mensaje claro |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-CONT-13: Cost Center Allocation

**Objetivo:** Verificar la asignación automática de centros de costo.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear un **Cost Center Allocation** (ej: 60% CC-A, 40% CC-B) | Asignación creada |
| 2 | Crear una factura que use el centro de costo padre | Factura creada |
| 3 | Enviar la factura | Los asientos GL se distribuyen según la asignación |
| 4 | Verificar en el Libro Mayor | Los montos se distribuyeron correctamente |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-CONT-14: Budget con Distribución Mensual (v16)

**Objetivo:** Verificar el sistema de presupuestos mejorado.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear un **Budget** con distribución mensual | Presupuesto creado con montos por mes |
| 2 | Registrar un gasto dentro del presupuesto | Se registra sin alertas |
| 3 | Registrar un gasto que exceda el presupuesto mensual | El sistema genera una alerta/bloqueo según configuración |
| 4 | Revisar el reporte **Budget Variance** | Muestra las desviaciones por mes correctamente |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-CONT-15: Reportes Generales

**Objetivo:** Verificar que los reportes principales funcionan correctamente.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Generar **Trial Balance** (Balance de Comprobación) | Se carga rápidamente, datos correctos |
| 2 | Generar **Profit and Loss** (Estado de Resultados) | Datos correctos, filtra por período |
| 3 | Generar **Balance Sheet** (Balance General) | Cuadra activo = pasivo + capital |
| 4 | Generar **General Ledger** con filtro por cuenta | Detalle correcto de movimientos |
| 5 | Generar **Accounts Receivable** (Cuentas por Cobrar) | Antigüedad de saldos correcta |
| 6 | Generar **Accounts Payable** (Cuentas por Pagar) | Antigüedad de saldos correcta |

**Resultado:** ☐ PASA / ☐ FALLA

---

*Guía del módulo de Contabilidad — Dossier de Migración ERPNext v13 → v16*
