# Guía de Migración: Módulo de Ventas (Selling)
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
| CRM | **Módulo CRM separado** → app Frappe CRM (v16) | 🔴 Crítico |
| POS | **Point of Sale completamente rediseñado** (v15) | 🔴 Alto |
| Pagos | Nuevo flujo de pagos con doctype **Payment** | 🟡 Medio |
| Reserva | **Stock Reservation** desde Órdenes de Venta | 🟡 Medio |
| Pricing | **Pricing Rules** mejoradas con más condiciones | 🟢 Bajo |
| Cupones | Nuevo doctype **Coupon Code** (v15) | 🟢 Bajo |
| Comisiones | **Sales Partner** con tracking de comisiones mejorado | 🟢 Bajo |

---

## 2. Cambios Detallados por Versión

### 2.1 Cambios en v14 (desde v13)

#### a) Pricing Rules Mejoradas
- Las reglas de precio ahora soportan condiciones adicionales:
  - Cantidad mínima/máxima
  - Fechas de vigencia
  - Combinaciones de artículos
  - Descuentos por combinación de artículos (ej: "Compra X y Y juntos, obtén 10% de descuento")
- Soporte para descuentos progresivos (tiered discounts)

#### b) Sales Partner y Comisiones
- Tracking mejorado de comisiones por Sales Partner
- Reporte de transacciones por Sales Partner con detalle de comisiones

#### c) Mejoras en Cotización y Orden de Venta
- Formularios reestructurados con más campos
- "Partial Delivery" (entrega parcial) mejor gestionada
- Integración con Drop Shipment mejorada

#### d) Descuentos Comerciales en Factura
- Soporte para descuentos comerciales y no comerciales directamente en la factura
- Los descuentos pueden registrarse en cuentas contables separadas

### 2.2 Cambios en v15 (desde v14)

#### a) Point of Sale (POS) Rediseñado ⭐
- **Interfaz completamente nueva** construida con Vue.js
- Características principales:
  - Modo offline con sincronización automática
  - Escaneo de código de barras integrado
  - Búsqueda rápida de artículos con imágenes
  - Selección de cliente con creación rápida
  - Modo restaurante con gestión de mesas
  - Pantalla de display para el cliente
  - Múltiples métodos de pago en una sola transacción
  - Cierre de caja con conteo de efectivo
- Los **POS Profiles** existentes necesitan ser reconfigurados
- Los scripts personalizados del POS anterior **no funcionarán**

#### b) Stock Reservation desde Orden de Venta
- Botón **Reserve Stock** disponible en la Orden de Venta enviada
- El stock reservado no aparece como disponible para otros pedidos
- Integración con el flujo de Pick List → Delivery Note

#### c) Coupon Code
- Nuevo doctype **Coupon Code** para descuentos promocionales
- Se vincula a Pricing Rules
- Soporta: usos limitados, fecha de vigencia, monto mínimo de compra
- Aplicable en e-commerce y en transacciones manuales

#### d) Quotation Improvements
- Cotizaciones pueden enviarse por email con vista previa del PDF mejorada
- Vista Kanban por defecto en la lista de cotizaciones

### 2.3 Cambios en v16 (desde v15)

#### a) Separación del CRM ⭐⭐ (Cambio Crítico)

> ⚠️ **ATENCIÓN:** Este es uno de los cambios más importantes para el módulo de Ventas.

El módulo CRM fue **completamente removido** de ERPNext y movido a una aplicación independiente: **Frappe CRM**.

**Doctypes removidos de ERPNext:**
| Doctype | Estado en v16 |
|---------|--------------|
| Lead (Prospecto) | ❌ Removido — requiere app Frappe CRM |
| Opportunity (Oportunidad) | ❌ Removido — requiere app Frappe CRM |
| Campaign (Campaña) | ❌ Removido — requiere app Frappe CRM |
| Lead Source (Fuente de Prospecto) | ❌ Removido — requiere app Frappe CRM |
| Sales Stage | ❌ Removido — requiere app Frappe CRM |
| Email Campaign | ❌ Removido — requiere app Frappe CRM |
| Customer (Cliente) | ✅ Permanece en ERPNext |
| Sales Partner | ✅ Permanece en ERPNext |
| Quotation (Cotización) | ✅ Permanece en ERPNext |

**Si usan el flujo Lead → Opportunity → Quotation:**
1. Deben instalar la app **Frappe CRM** en el bench
2. Los datos de CRM se migran automáticamente si la app está presente
3. Sin la app, los menús y datos de CRM desaparecen

**Si NO usan CRM:** No hay impacto directo; el módulo de Ventas (Quotation, Sales Order, etc.) funciona normalmente.

#### b) Nuevo Flujo de Pagos
- Cobros a clientes ahora usan el doctype **Payment** en lugar de Payment Entry
- El flujo desde factura → cobro es más directo y automatizado

#### c) Sales Analytics con Dimensiones
- Los reportes de ventas ahora pueden filtrar por Inventory Dimensions definidas

---

## 3. Nuevas Funcionalidades

### 3.1 Point of Sale (POS) v15+

**¿Cómo acceder?**
1. Ir a **Ventas → POS** (o buscar "Point of Sale" en la barra de búsqueda)
2. Se abre la nueva interfaz de POS

**Configuración:**
1. Crear/actualizar el **POS Profile** con:
   - Almacén por defecto
   - Métodos de pago aceptados
   - Formato de impresión
   - Configuración de usuario/cajero
2. Asignar el POS Profile al usuario

**Flujo de venta:**
1. Seleccionar o buscar el cliente
2. Agregar artículos (búsqueda, escaneo, o catálogo visual)
3. Aplicar descuentos si corresponde
4. Seleccionar método de pago y monto
5. Completar la venta → se genera la Factura de Venta automáticamente
6. Imprimir ticket

**Cierre de caja:**
1. Al final del turno, hacer clic en **Close POS**
2. Ingresar el conteo de efectivo
3. El sistema calcula la diferencia y genera el cierre

### 3.2 Coupon Code

**Cómo configurarlo:**
1. Crear una **Pricing Rule** con el descuento deseado
2. Ir a **Ventas → Coupon Code → Nuevo**
3. Vincularlo a la Pricing Rule
4. Configurar: código, usos máximos, fecha de vigencia
5. Al crear una transacción de venta, ingresar el código de cupón para aplicar el descuento

### 3.3 Stock Reservation

Ver la documentación detallada en la [Guía de Inventario](./02_inventario.md#33-stock-reservation).

---

## 4. Cambios Rompientes y Acciones Requeridas

### 4.1 CRM Decoupling (Separación del CRM)

| Aspecto | Impacto | Acción Requerida |
|---------|---------|-----------------|
| Custom Scripts | Scripts que referencian Lead, Opportunity, Campaign fallarán | Eliminar o condicionar al app Frappe CRM |
| Custom Reports | Reportes que consultan doctypes CRM fallarán | Actualizar o eliminar |
| Print Formats | Formatos que incluyen datos CRM | Actualizar referencias |
| Workflows | Flujos de trabajo que incluyen pasos CRM | Rediseñar sin CRM o instalar la app |
| Buttons/Links | Botones personalizados que abren doctypes CRM | Eliminar o condicionar |

**Decisión requerida:** ¿Instalar Frappe CRM como app adicional o prescindir de CRM?

### 4.2 POS Rediseñado

| Aspecto | Impacto | Acción Requerida |
|---------|---------|-----------------|
| POS Profile | Puede necesitar reconfiguración | Revisar y actualizar POS Profiles |
| Custom JS | Scripts del POS anterior no funcionan | Reescribir usando la nueva API |
| Formatos de impresión | El ticket usa nuevo render engine | Verificar que los formatos se imprimen bien |
| Integraciones de pago | Terminales de pago pueden requerir actualización | Verificar compatibilidad |

### 4.3 Payment Entry → Payment

- Mismo impacto que en el módulo de Contabilidad
- Scripts que crean Payment Entry para cobros deben actualizarse

---

## 5. Cambios en la Interfaz de Usuario

### 5.1 Orden de Venta
- Indicador visual de **Stock Reservado** en cada línea
- Botón de **Reserve Stock** en la barra de acciones
- Vista de progreso de entrega mejorada

### 5.2 Cotización
- Lista con vista **Kanban** por defecto (por estado: Borrador, Enviada, Aceptada, Rechazada)
- Vista previa mejorada del PDF antes de enviar por email

### 5.3 POS
- Interfaz completamente nueva, touch-friendly
- Catálogo visual de artículos con imágenes
- Panel de pago con soporte de múltiples métodos

### 5.4 Factura de Venta
- Formulario con pestañas (tabs)
- Link directo al nuevo doctype Payment para registrar cobros

---

## 6. Pruebas de Validación (UAT)

---

### UAT-VTA-01: Flujo Completo Cotización → Orden → Entrega → Factura

**Objetivo:** Verificar el ciclo de venta completo.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear una **Cotización** con 2 artículos | Cotización creada |
| 2 | Enviar la cotización | Estado: Enviada |
| 3 | Desde la cotización, crear **Orden de Venta** | OV creada con datos de la cotización |
| 4 | Enviar la Orden de Venta | OV en estado: Enviada |
| 5 | Desde la OV, crear **Delivery Note** | Nota de entrega con artículos correctos |
| 6 | Enviar la Delivery Note | Stock se reduce |
| 7 | Desde la OV, crear **Sales Invoice** | Factura con datos correctos |
| 8 | Enviar la Factura | Asientos GL se crean |
| 9 | Verificar que la OV muestra 100% entregado y facturado | Indicadores de progreso correctos |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-VTA-02: Pricing Rules y Descuentos

**Objetivo:** Verificar que las reglas de precio se aplican correctamente.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear una **Pricing Rule** (ej: 10% descuento para qty ≥ 10) | Regla creada |
| 2 | Crear una Orden de Venta con cantidad < 10 | No se aplica descuento |
| 3 | Cambiar la cantidad a ≥ 10 | El descuento de 10% se aplica automáticamente |
| 4 | Verificar que el total refleja el descuento | Cálculo correcto |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-VTA-03: Coupon Code

**Objetivo:** Verificar el uso de códigos de cupón.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear un **Coupon Code** vinculado a una Pricing Rule | Cupón creado |
| 2 | Crear una Orden de Venta y aplicar el código de cupón | El descuento se aplica |
| 3 | Intentar usar un cupón expirado | El sistema rechaza el código |
| 4 | Intentar usar un cupón que excedió su límite de usos | El sistema rechaza el código |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-VTA-04: POS - Venta Básica

**Objetivo:** Verificar el flujo básico del nuevo Point of Sale.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Verificar que el **POS Profile** está configurado | Perfil activo y asignado |
| 2 | Abrir la interfaz de **Point of Sale** | La nueva interfaz se carga correctamente |
| 3 | Seleccionar un cliente | El cliente se vincula a la transacción |
| 4 | Agregar artículos por búsqueda y por código de barras | Los artículos se agregan al carrito |
| 5 | Modificar cantidades en el carrito | Los totales se recalculan |
| 6 | Seleccionar método de pago (efectivo) y completar | La factura se genera y se imprime |
| 7 | Verificar que la factura aparece en la lista de facturas | La factura existe con datos correctos |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-VTA-05: POS - Cierre de Caja

**Objetivo:** Verificar el cierre de caja del POS.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Realizar 2-3 ventas desde el POS | Ventas completadas |
| 2 | Hacer clic en **Close POS** | Se abre el formulario de cierre |
| 3 | Ingresar el conteo de efectivo | Los campos de conteo aparecen |
| 4 | Verificar que el sistema calcula la diferencia | Diferencia = Conteo - Ventas |
| 5 | Confirmar el cierre | El cierre se registra |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-VTA-06: Stock Reservation desde Orden de Venta

**Objetivo:** Verificar la reserva de stock desde ventas.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear y enviar una Orden de Venta | OV enviada |
| 2 | Hacer clic en **Reserve Stock** | Reservación creada |
| 3 | Verificar en Stock Balance que el stock disponible se redujo | Disponible = Total - Reservado |
| 4 | Crear Delivery Note desde la OV | Se consume el stock reservado |
| 5 | Verificar que la reserva se libera | Reservación eliminada |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-VTA-07: Cobro de Factura (Nuevo Doctype Payment)

**Objetivo:** Verificar el cobro usando el nuevo sistema de pagos.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear y enviar una Factura de Venta | Factura enviada |
| 2 | Desde la factura, hacer clic en **Create → Payment** | Se abre el formulario Payment pre-llenado |
| 3 | Verificar que los datos se pre-llenan correctamente | Cliente, monto, facturas pendientes correctos |
| 4 | Enviar el Payment | Pago registrado, factura se marca como pagada |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-VTA-08: Entrega Parcial

**Objetivo:** Verificar el flujo de entregas parciales.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Crear OV con 100 unidades de un artículo | OV creada |
| 2 | Crear Delivery Note por 40 unidades | Entrega parcial registrada |
| 3 | Verificar que la OV muestra 40% entregado | Indicador de progreso correcto |
| 4 | Crear segunda Delivery Note por 60 unidades | Entrega completada |
| 5 | Verificar que la OV muestra 100% entregado | Indicador completo |

**Resultado:** ☐ PASA / ☐ FALLA

---

### UAT-VTA-09: Reportes de Ventas

**Objetivo:** Verificar que los reportes principales de ventas funcionan.

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Generar **Sales Analytics** | Datos correctos, filtros funcionan |
| 2 | Generar **Sales Register** | Detalle de ventas correcto |
| 3 | Generar **Ordered Items to be Delivered** | Artículos pendientes listados |
| 4 | Generar **Sales Person Wise Transaction Summary** | Resumen por vendedor correcto |
| 5 | Generar **Gross Profit** | Utilidad bruta calculada correctamente |

**Resultado:** ☐ PASA / ☐ FALLA

---

*Guía del módulo de Ventas — Dossier de Migración ERPNext v13 → v16*
