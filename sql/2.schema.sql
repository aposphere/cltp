/*
 Navicat SQL Server Data Transfer

 Source Server         : TEST1
 Source Server Type    : SQL Server
 Source Server Version : 15004178
 Source Host           : cltp.ll:1433
 Source Catalog        : test0
 Source Schema         : cltp

 Target Server Type    : SQL Server
 Target Server Version : 15004178
 File Encoding         : 65001

 Date: 12/10/2021 09:44:26
*/


-- ----------------------------
-- Table structure for audit_log
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[audit_log]') AND type IN ('U'))
	DROP TABLE [cltp].[audit_log]
GO

CREATE TABLE [cltp].[audit_log] (
  [id] bigint  IDENTITY(1,1) NOT NULL,
  [type] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [ref] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [actor] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [message] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [creation_timestamp] datetime DEFAULT getdate() NOT NULL
)
GO

ALTER TABLE [cltp].[audit_log] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for connection_plate_pcr_plate
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[connection_plate_pcr_plate]') AND type IN ('U'))
	DROP TABLE [cltp].[connection_plate_pcr_plate]
GO

CREATE TABLE [cltp].[connection_plate_pcr_plate] (
  [plate_id] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [pcr_plate_id] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [coordinate] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [creation_timestamp] datetime DEFAULT getdate() NOT NULL
)
GO

ALTER TABLE [cltp].[connection_plate_pcr_plate] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for connection_pool_rack
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[connection_pool_rack]') AND type IN ('U'))
	DROP TABLE [cltp].[connection_pool_rack]
GO

CREATE TABLE [cltp].[connection_pool_rack] (
  [pool_id] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [rack_id] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [coordinate] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [creation_timestamp] datetime DEFAULT getdate() NOT NULL,
  [rack_i] int DEFAULT 0 NOT NULL
)
GO

ALTER TABLE [cltp].[connection_pool_rack] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for connection_pool_sample
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[connection_pool_sample]') AND type IN ('U'))
	DROP TABLE [cltp].[connection_pool_sample]
GO

CREATE TABLE [cltp].[connection_pool_sample] (
  [pool_id] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [sample_id] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [technician] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [source] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [comment] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [creation_timestamp] datetime DEFAULT getdate() NOT NULL
)
GO

ALTER TABLE [cltp].[connection_pool_sample] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for connection_rack_plate
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[connection_rack_plate]') AND type IN ('U'))
	DROP TABLE [cltp].[connection_rack_plate]
GO

CREATE TABLE [cltp].[connection_rack_plate] (
  [rack_id] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [plate_id] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [coordinate] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [creation_timestamp] datetime DEFAULT getdate() NOT NULL,
  [rack_i] int DEFAULT 0 NOT NULL
)
GO

ALTER TABLE [cltp].[connection_rack_plate] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for interpretation
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[interpretation]') AND type IN ('U'))
	DROP TABLE [cltp].[interpretation]
GO

CREATE TABLE [cltp].[interpretation] (
  [id] uniqueidentifier  NOT NULL,
  [result_entry_id] uniqueidentifier  NOT NULL,
  [pool_id] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [interpretation] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [creation_timestamp] datetime DEFAULT getdate() NOT NULL
)
GO

ALTER TABLE [cltp].[interpretation] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for interpretation_exported
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[interpretation_exported]') AND type IN ('U'))
	DROP TABLE [cltp].[interpretation_exported]
GO

CREATE TABLE [cltp].[interpretation_exported] (
  [id] uniqueidentifier  NOT NULL,
  [interpretation_id] uniqueidentifier  NOT NULL,
  [creation_timestamp] datetime DEFAULT getdate() NOT NULL
)
GO

ALTER TABLE [cltp].[interpretation_exported] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for pcr_plate
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[pcr_plate]') AND type IN ('U'))
	DROP TABLE [cltp].[pcr_plate]
GO

CREATE TABLE [cltp].[pcr_plate] (
  [pcr_plate_id] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [creation_timestamp] datetime DEFAULT getdate() NOT NULL
)
GO

ALTER TABLE [cltp].[pcr_plate] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for plate
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[plate]') AND type IN ('U'))
	DROP TABLE [cltp].[plate]
GO

CREATE TABLE [cltp].[plate] (
  [plate_id] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [creation_timestamp] datetime DEFAULT getdate() NOT NULL
)
GO

ALTER TABLE [cltp].[plate] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for pool
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[pool]') AND type IN ('U'))
	DROP TABLE [cltp].[pool]
GO

CREATE TABLE [cltp].[pool] (
  [pool_id] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [creation_timestamp] datetime DEFAULT getdate() NOT NULL
)
GO

ALTER TABLE [cltp].[pool] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for pool_arrival
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[pool_arrival]') AND type IN ('U'))
	DROP TABLE [cltp].[pool_arrival]
GO

CREATE TABLE [cltp].[pool_arrival] (
  [id] uniqueidentifier  NOT NULL,
  [pool_id] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [technician] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [source] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [comment] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [creation_timestamp] datetime DEFAULT getdate() NOT NULL
)
GO

ALTER TABLE [cltp].[pool_arrival] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for probe_order
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[probe_order]') AND type IN ('U'))
	DROP TABLE [cltp].[probe_order]
GO

CREATE TABLE [cltp].[probe_order] (
  [id] uniqueidentifier  NOT NULL,
  [comment] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [unternehmen_key] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [unternehmen_uid] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [unternehmen_typ] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [unternehmen_name] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [unternehmen_abteilung] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [unternehmen_ort] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [unternehmen_postleitzahl] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [unternehmen_strasse] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [unternehmen_email] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [unternehmen_telefon_geschaeft] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [unternehmen_telefon_mobil] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [poolmanager_nachname] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [poolmanager_vorname] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [barcode_nummer] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [creation_timestamp] datetime DEFAULT getdate() NOT NULL
)
GO

ALTER TABLE [cltp].[probe_order] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for rack
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[rack]') AND type IN ('U'))
	DROP TABLE [cltp].[rack]
GO

CREATE TABLE [cltp].[rack] (
  [rack_id] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [creation_timestamp] datetime DEFAULT getdate() NOT NULL,
  [i] int DEFAULT 0 NOT NULL
)
GO

ALTER TABLE [cltp].[rack] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for result
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[result]') AND type IN ('U'))
	DROP TABLE [cltp].[result]
GO

CREATE TABLE [cltp].[result] (
  [id] uniqueidentifier  NOT NULL,
  [pcr_plate_id] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [creation_timestamp] datetime DEFAULT getdate() NOT NULL
)
GO

ALTER TABLE [cltp].[result] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for result_entry
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[result_entry]') AND type IN ('U'))
	DROP TABLE [cltp].[result_entry]
GO

CREATE TABLE [cltp].[result_entry] (
  [id] uniqueidentifier  NOT NULL,
  [result_id] uniqueidentifier  NOT NULL,
  [coordinate] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [n1n2_cq] float(53)  NULL,
  [human_ic_cq] float(53)  NULL,
  [creation_timestamp] datetime DEFAULT getdate() NOT NULL
)
GO

ALTER TABLE [cltp].[result_entry] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for sample
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[sample]') AND type IN ('U'))
	DROP TABLE [cltp].[sample]
GO

CREATE TABLE [cltp].[sample] (
  [sample_id] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [staff_id] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [creation_timestamp] datetime DEFAULT getdate() NOT NULL
)
GO

ALTER TABLE [cltp].[sample] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- Table structure for staff
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[staff]') AND type IN ('U'))
	DROP TABLE [cltp].[staff]
GO

CREATE TABLE [cltp].[staff] (
  [staff_id] varchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS  NOT NULL,
  [title] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [first_name] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [last_name] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [email] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS  NULL,
  [creation_timestamp] datetime DEFAULT getdate() NOT NULL
)
GO

ALTER TABLE [cltp].[staff] SET (LOCK_ESCALATION = TABLE)
GO


-- ----------------------------
-- View structure for internal_probe_result
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[internal_probe_result]') AND type IN ('V'))
	DROP VIEW [cltp].[internal_probe_result]
GO

CREATE VIEW [cltp].[internal_probe_result] AS SELECT 'unternehmen_key' AS unternehmen_key,
    'unternehmen_uid' AS unternehmen_uid,
    'unternehmen_typ' AS unternehmen_typ,
    'unternehmen_name' AS unternehmen_name,
    'unternehmen_abteilung' AS unternehmen_abteilung,
    'unternehmen_ort' AS unternehmen_ort,
    'unternehmen_postleitzahl' AS unternehmen_postleitzahl,
    'unternehmen_strasse' AS unternehmen_strasse,
    'unternehmen_email' AS unternehmen_email,
    'unternehmen_telefon_geschaeft' AS unternehmen_telefon_geschaeft,
    'unternehmen_telefon_mobil'AS unternehmen_telefon_mobil,
    'poolmanager_nachname' AS poolmanager_nachname,
    'poolmanager_vorname' AS poolmanager_vorname,
    cltp.pool.pool_id AS barcode_nummer,
    cltp.interpretation.creation_timestamp AS untersuchung_datum,
    cltp.interpretation.interpretation AS untersuchung_resultat,
    'Universitaetsspital Neuropathologie' AS untersuchung_absender
   FROM ((cltp.connection_pool_sample
     JOIN cltp.pool ON (((cltp.pool.pool_id) = (cltp.connection_pool_sample.pool_id))))
     JOIN cltp.interpretation ON (((cltp.pool.pool_id) = (cltp.interpretation.pool_id))));
GO


-- ----------------------------
-- View structure for internal_probe_result_pending
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[internal_probe_result_pending]') AND type IN ('V'))
	DROP VIEW [cltp].[internal_probe_result_pending]
GO

CREATE VIEW [cltp].[internal_probe_result_pending] AS SELECT 'unternehmen_key' AS unternehmen_key,
    'unternehmen_uid' AS unternehmen_uid,
    'unternehmen_typ' AS unternehmen_typ,
    'unternehmen_name' AS unternehmen_name,
    'unternehmen_abteilung' AS unternehmen_abteilung,
    'unternehmen_ort' AS unternehmen_ort,
    'unternehmen_postleitzahl' AS unternehmen_postleitzahl,
    'unternehmen_strasse' AS unternehmen_strasse,
    'unternehmen_email' AS unternehmen_email,
    'unternehmen_telefon_geschaeft' AS unternehmen_telefon_geschaeft,
    'unternehmen_telefon_mobil'AS unternehmen_telefon_mobil,
    'poolmanager_nachname' AS poolmanager_nachname,
    'poolmanager_vorname' AS poolmanager_vorname,
    cltp.pool.pool_id AS barcode_nummer,
    cltp.interpretation_pending.creation_timestamp AS untersuchung_datum,
    cltp.interpretation_pending.interpretation AS untersuchung_resultat,
    'Universitaetsspital Neuropathologie' AS untersuchung_absender
   FROM ((cltp.connection_pool_sample
     JOIN cltp.pool ON (((cltp.pool.pool_id) = (cltp.connection_pool_sample.pool_id))))
     JOIN cltp.interpretation_pending ON (((cltp.pool.pool_id) = (cltp.interpretation_pending.pool_id))));
GO


-- ----------------------------
-- View structure for interpretation_pending
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[interpretation_pending]') AND type IN ('V'))
	DROP VIEW [cltp].[interpretation_pending]
GO

CREATE VIEW [cltp].[interpretation_pending] AS SELECT cltp.interpretation.* FROM (cltp.interpretation LEFT JOIN cltp.interpretation_exported ON cltp.interpretation.id = cltp.interpretation_exported.interpretation_id)
WHERE cltp.interpretation_exported.id IS NULL;
GO


-- ----------------------------
-- View structure for mapping
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[mapping]') AND type IN ('V'))
	DROP VIEW [cltp].[mapping]
GO

CREATE VIEW [cltp].[mapping] AS SELECT cltp.pcr_plate.pcr_plate_id,
    cltp.connection_plate_pcr_plate.coordinate AS plate_coordinate,
    cltp.plate.plate_id,
    cltp.connection_rack_plate.coordinate AS rack_coordinate,
    cltp.rack.rack_id,
    cltp.rack.i AS rack_i,
    cltp.connection_pool_rack.coordinate AS pool_coordinate,
    cltp.pool.pool_id
   FROM ((((((cltp.pcr_plate
     JOIN cltp.connection_plate_pcr_plate ON (((cltp.pcr_plate.pcr_plate_id) = (cltp.connection_plate_pcr_plate.pcr_plate_id))))
     JOIN cltp.plate ON (((cltp.connection_plate_pcr_plate.plate_id) = (cltp.plate.plate_id))))
     JOIN cltp.connection_rack_plate ON (((cltp.plate.plate_id) = (cltp.connection_rack_plate.plate_id))))
     JOIN cltp.rack ON ((((cltp.connection_rack_plate.rack_id) = (cltp.rack.rack_id)) AND ((cltp.connection_rack_plate.rack_i) = (cltp.rack.i)))))
     JOIN cltp.connection_pool_rack ON ((((cltp.rack.rack_id) = (cltp.connection_pool_rack.rack_id)) AND ((cltp.rack.i) = (cltp.connection_pool_rack.rack_i)))))
     JOIN cltp.pool ON (((cltp.connection_pool_rack.pool_id) = (cltp.pool.pool_id))));
GO


-- ----------------------------
-- View structure for pcr_plate_ready
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[pcr_plate_ready]') AND type IN ('V'))
	DROP VIEW [cltp].[pcr_plate_ready]
GO

CREATE VIEW [cltp].[pcr_plate_ready] AS SELECT cltp.pcr_plate.* FROM (cltp.pcr_plate LEFT JOIN cltp.result ON cltp.pcr_plate.pcr_plate_id = cltp.result.pcr_plate_id)
WHERE cltp.result.pcr_plate_id IS NULL;
GO


-- ----------------------------
-- View structure for plate_ready
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[plate_ready]') AND type IN ('V'))
	DROP VIEW [cltp].[plate_ready]
GO

CREATE VIEW [cltp].[plate_ready] AS SELECT cltp.plate.* FROM (cltp.plate LEFT JOIN cltp.connection_plate_pcr_plate ON cltp.plate.plate_id = cltp.connection_plate_pcr_plate.plate_id)
WHERE cltp.connection_plate_pcr_plate.plate_id IS NULL;
GO


-- ----------------------------
-- View structure for pool_ready
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[pool_ready]') AND type IN ('V'))
	DROP VIEW [cltp].[pool_ready]
GO

CREATE VIEW [cltp].[pool_ready] AS SELECT cltp.pool.* FROM (cltp.pool LEFT JOIN cltp.connection_pool_rack ON cltp.pool.pool_id = cltp.connection_pool_rack.pool_id)
WHERE cltp.connection_pool_rack.pool_id IS NULL;
GO


-- ----------------------------
-- View structure for probe_order_ready
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[probe_order_ready]') AND type IN ('V'))
	DROP VIEW [cltp].[probe_order_ready]
GO

CREATE VIEW [cltp].[probe_order_ready] AS SELECT cltp.probe_order.* FROM (cltp.probe_order LEFT JOIN cltp.pool ON cltp.probe_order.barcode_nummer = cltp.pool.pool_id)
WHERE cltp.pool.pool_id IS NULL;
GO


-- ----------------------------
-- View structure for probe_result
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[probe_result]') AND type IN ('V'))
	DROP VIEW [cltp].[probe_result]
GO

CREATE VIEW [cltp].[probe_result] AS SELECT cltp.probe_order.unternehmen_key,
    cltp.probe_order.unternehmen_uid,
    cltp.probe_order.unternehmen_typ,
    cltp.probe_order.unternehmen_name,
    cltp.probe_order.unternehmen_abteilung,
    cltp.probe_order.unternehmen_ort,
    cltp.probe_order.unternehmen_postleitzahl,
    cltp.probe_order.unternehmen_strasse,
    cltp.probe_order.unternehmen_email,
    cltp.probe_order.unternehmen_telefon_geschaeft,
    cltp.probe_order.unternehmen_telefon_mobil,
    cltp.probe_order.poolmanager_nachname,
    cltp.probe_order.poolmanager_vorname,
    cltp.probe_order.barcode_nummer,
    cltp.interpretation.creation_timestamp AS untersuchung_datum,
    cltp.interpretation.interpretation AS untersuchung_resultat,
    'Universitaetsspital Neuropathologie' AS untersuchung_absender
   FROM (cltp.probe_order
     JOIN cltp.interpretation ON ((cltp.probe_order.barcode_nummer = (cltp.interpretation.pool_id))));
GO


-- ----------------------------
-- View structure for probe_result_pending
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[probe_result_pending]') AND type IN ('V'))
	DROP VIEW [cltp].[probe_result_pending]
GO

CREATE VIEW [cltp].[probe_result_pending] AS SELECT cltp.probe_order.unternehmen_key,
    cltp.probe_order.unternehmen_uid,
    cltp.probe_order.unternehmen_typ,
    cltp.probe_order.unternehmen_name,
    cltp.probe_order.unternehmen_abteilung,
    cltp.probe_order.unternehmen_ort,
    cltp.probe_order.unternehmen_postleitzahl,
    cltp.probe_order.unternehmen_strasse,
    cltp.probe_order.unternehmen_email,
    cltp.probe_order.unternehmen_telefon_geschaeft,
    cltp.probe_order.unternehmen_telefon_mobil,
    cltp.probe_order.poolmanager_nachname,
    cltp.probe_order.poolmanager_vorname,
    cltp.probe_order.barcode_nummer,
    cltp.interpretation_pending.creation_timestamp AS untersuchung_datum,
    cltp.interpretation_pending.interpretation AS untersuchung_resultat,
    'Universitaetsspital Neuropathologie' AS untersuchung_absender
   FROM (cltp.probe_order
     JOIN cltp.interpretation_pending ON ((cltp.probe_order.barcode_nummer = (cltp.interpretation_pending.pool_id))));
GO


-- ----------------------------
-- View structure for rack_ready
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[rack_ready]') AND type IN ('V'))
	DROP VIEW [cltp].[rack_ready]
GO

CREATE VIEW [cltp].[rack_ready] AS SELECT cltp.rack.* FROM (cltp.rack LEFT JOIN cltp.connection_rack_plate ON (cltp.rack.rack_id = cltp.connection_rack_plate.rack_id AND cltp.rack.i = cltp.connection_rack_plate.rack_i))
WHERE cltp.connection_rack_plate.rack_id IS NULL;
GO


-- ----------------------------
-- View structure for sample_ready
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[sample_ready]') AND type IN ('V'))
	DROP VIEW [cltp].[sample_ready]
GO

CREATE VIEW [cltp].[sample_ready] AS SELECT cltp.sample.* FROM (cltp.sample LEFT JOIN cltp.connection_pool_sample ON cltp.sample.sample_id = cltp.connection_pool_sample.sample_id)
WHERE cltp.connection_pool_sample.sample_id IS NULL;
GO


-- ----------------------------
-- View structure for unused_rack
-- ----------------------------
IF EXISTS (SELECT * FROM sys.all_objects WHERE object_id = OBJECT_ID(N'[cltp].[unused_rack]') AND type IN ('V'))
	DROP VIEW [cltp].[unused_rack]
GO

CREATE VIEW [cltp].[unused_rack] AS SELECT cltp.rack.rack_id,
    cltp.rack.creation_timestamp,
    cltp.rack.i,
    cltp.connection_rack_plate.plate_id
   FROM (cltp.rack
     LEFT JOIN cltp.connection_rack_plate ON ((((cltp.rack.rack_id) = (cltp.connection_rack_plate.rack_id)) AND (cltp.rack.i = cltp.connection_rack_plate.rack_i))))
  WHERE (cltp.connection_rack_plate.plate_id IS NULL);
GO


-- ----------------------------
-- Auto increment value for audit_log
-- ----------------------------
DBCC CHECKIDENT ('[cltp].[audit_log]', RESEED, 16)
GO


-- ----------------------------
-- Primary Key structure for table audit_log
-- ----------------------------
ALTER TABLE [cltp].[audit_log] ADD CONSTRAINT [PK__audit_lo__3213E83F8DCCB61A] PRIMARY KEY CLUSTERED ([id])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
ON [PRIMARY]
GO


-- ----------------------------
-- Uniques structure for table connection_plate_pcr_plate
-- ----------------------------
ALTER TABLE [cltp].[connection_plate_pcr_plate] ADD CONSTRAINT [uq_connection_plate_pcr_plate] UNIQUE NONCLUSTERED ([plate_id] ASC, [pcr_plate_id] ASC, [coordinate] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table connection_plate_pcr_plate
-- ----------------------------
ALTER TABLE [cltp].[connection_plate_pcr_plate] ADD CONSTRAINT [PK__connecti__2AB1E8A7180368C9] PRIMARY KEY CLUSTERED ([plate_id], [pcr_plate_id], [coordinate])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
ON [PRIMARY]
GO


-- ----------------------------
-- Uniques structure for table connection_pool_rack
-- ----------------------------
ALTER TABLE [cltp].[connection_pool_rack] ADD CONSTRAINT [layout] UNIQUE NONCLUSTERED ([pool_id] ASC, [rack_id] ASC, [rack_i] ASC, [coordinate] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
ON [PRIMARY]
GO

ALTER TABLE [cltp].[connection_pool_rack] ADD CONSTRAINT [uq_connection_pool_rack] UNIQUE NONCLUSTERED ([pool_id] ASC, [rack_id] ASC, [rack_i] ASC, [coordinate] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table connection_pool_rack
-- ----------------------------
ALTER TABLE [cltp].[connection_pool_rack] ADD CONSTRAINT [PK__connecti__07D800CE21BC3B7C] PRIMARY KEY CLUSTERED ([pool_id], [rack_id], [coordinate])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table connection_pool_sample
-- ----------------------------
ALTER TABLE [cltp].[connection_pool_sample] ADD CONSTRAINT [connection_pool_sample_pkey] PRIMARY KEY CLUSTERED ([pool_id], [sample_id])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
ON [PRIMARY]
GO


-- ----------------------------
-- Uniques structure for table connection_rack_plate
-- ----------------------------
ALTER TABLE [cltp].[connection_rack_plate] ADD CONSTRAINT [uq_connection_rack_plate] UNIQUE NONCLUSTERED ([rack_id] ASC, [rack_i] ASC, [plate_id] ASC, [coordinate] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table connection_rack_plate
-- ----------------------------
ALTER TABLE [cltp].[connection_rack_plate] ADD CONSTRAINT [PK__connecti__DD1A95DC4822EDD9] PRIMARY KEY CLUSTERED ([rack_id], [plate_id], [coordinate])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
ON [PRIMARY]
GO


-- ----------------------------
-- Uniques structure for table interpretation
-- ----------------------------
ALTER TABLE [cltp].[interpretation] ADD CONSTRAINT [uq_interpretation_result_entry_pool] UNIQUE NONCLUSTERED ([result_entry_id] ASC, [pool_id] ASC, [interpretation] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table interpretation
-- ----------------------------
ALTER TABLE [cltp].[interpretation] ADD CONSTRAINT [interpretation_pkey] PRIMARY KEY CLUSTERED ([id])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table interpretation_exported
-- ----------------------------
ALTER TABLE [cltp].[interpretation_exported] ADD CONSTRAINT [PK__interpre__3213E83FE41F04F2] PRIMARY KEY CLUSTERED ([id])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table pcr_plate
-- ----------------------------
ALTER TABLE [cltp].[pcr_plate] ADD CONSTRAINT [pcr_plate_pkey] PRIMARY KEY CLUSTERED ([pcr_plate_id])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table plate
-- ----------------------------
ALTER TABLE [cltp].[plate] ADD CONSTRAINT [plate_pkey] PRIMARY KEY CLUSTERED ([plate_id])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table pool
-- ----------------------------
ALTER TABLE [cltp].[pool] ADD CONSTRAINT [pool_pkey] PRIMARY KEY CLUSTERED ([pool_id])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table pool_arrival
-- ----------------------------
ALTER TABLE [cltp].[pool_arrival] ADD CONSTRAINT [pool_arrival_pkey] PRIMARY KEY CLUSTERED ([id])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table probe_order
-- ----------------------------
ALTER TABLE [cltp].[probe_order] ADD CONSTRAINT [probe_order_pkey] PRIMARY KEY CLUSTERED ([id])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table rack
-- ----------------------------
ALTER TABLE [cltp].[rack] ADD CONSTRAINT [rack_pkey] PRIMARY KEY CLUSTERED ([rack_id], [i])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table result
-- ----------------------------
ALTER TABLE [cltp].[result] ADD CONSTRAINT [result_pkey] PRIMARY KEY CLUSTERED ([id])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table result_entry
-- ----------------------------
ALTER TABLE [cltp].[result_entry] ADD CONSTRAINT [result_entry_pkey] PRIMARY KEY CLUSTERED ([id])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table sample
-- ----------------------------
ALTER TABLE [cltp].[sample] ADD CONSTRAINT [sample_pkey] PRIMARY KEY CLUSTERED ([sample_id])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
ON [PRIMARY]
GO


-- ----------------------------
-- Primary Key structure for table staff
-- ----------------------------
ALTER TABLE [cltp].[staff] ADD CONSTRAINT [staff_pkey] PRIMARY KEY CLUSTERED ([staff_id])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
ON [PRIMARY]
GO


-- ----------------------------
-- Foreign Keys structure for table connection_plate_pcr_plate
-- ----------------------------
ALTER TABLE [cltp].[connection_plate_pcr_plate] ADD CONSTRAINT [fk_connection_plate_pcr_plate_pcr_plate] FOREIGN KEY ([pcr_plate_id]) REFERENCES [cltp].[pcr_plate] ([pcr_plate_id]) ON DELETE CASCADE ON UPDATE CASCADE
GO

ALTER TABLE [cltp].[connection_plate_pcr_plate] ADD CONSTRAINT [fk_connection_plate_pcr_plate_plate] FOREIGN KEY ([plate_id]) REFERENCES [cltp].[plate] ([plate_id]) ON DELETE CASCADE ON UPDATE CASCADE
GO


-- ----------------------------
-- Foreign Keys structure for table connection_pool_rack
-- ----------------------------
ALTER TABLE [cltp].[connection_pool_rack] ADD CONSTRAINT [fk_connection_pool_rack_pool] FOREIGN KEY ([pool_id]) REFERENCES [cltp].[pool] ([pool_id]) ON DELETE CASCADE ON UPDATE CASCADE
GO

ALTER TABLE [cltp].[connection_pool_rack] ADD CONSTRAINT [fk_connection_pool_rack_rack] FOREIGN KEY ([rack_id], [rack_i]) REFERENCES [cltp].[rack] ([rack_id], [i]) ON DELETE CASCADE ON UPDATE CASCADE
GO


-- ----------------------------
-- Foreign Keys structure for table connection_pool_sample
-- ----------------------------
ALTER TABLE [cltp].[connection_pool_sample] ADD CONSTRAINT [fk_connection_pool_sample_pool] FOREIGN KEY ([pool_id]) REFERENCES [cltp].[pool] ([pool_id]) ON DELETE CASCADE ON UPDATE CASCADE
GO

ALTER TABLE [cltp].[connection_pool_sample] ADD CONSTRAINT [fk_connection_pool_sample_sampl] FOREIGN KEY ([sample_id]) REFERENCES [cltp].[sample] ([sample_id]) ON DELETE CASCADE ON UPDATE CASCADE
GO


-- ----------------------------
-- Foreign Keys structure for table connection_rack_plate
-- ----------------------------
ALTER TABLE [cltp].[connection_rack_plate] ADD CONSTRAINT [fk_connection_rack_plate_plate] FOREIGN KEY ([plate_id]) REFERENCES [cltp].[plate] ([plate_id]) ON DELETE CASCADE ON UPDATE CASCADE
GO

ALTER TABLE [cltp].[connection_rack_plate] ADD CONSTRAINT [fk_connection_rack_plate_rack] FOREIGN KEY ([rack_id], [rack_i]) REFERENCES [cltp].[rack] ([rack_id], [i]) ON DELETE CASCADE ON UPDATE CASCADE
GO


-- ----------------------------
-- Foreign Keys structure for table interpretation
-- ----------------------------
ALTER TABLE [cltp].[interpretation] ADD CONSTRAINT [fk_interpretation_pool] FOREIGN KEY ([pool_id]) REFERENCES [cltp].[pool] ([pool_id]) ON DELETE CASCADE ON UPDATE CASCADE
GO

ALTER TABLE [cltp].[interpretation] ADD CONSTRAINT [fk_interpretation_result] FOREIGN KEY ([result_entry_id]) REFERENCES [cltp].[result_entry] ([id]) ON DELETE CASCADE ON UPDATE CASCADE
GO


-- ----------------------------
-- Foreign Keys structure for table pool_arrival
-- ----------------------------
ALTER TABLE [cltp].[pool_arrival] ADD CONSTRAINT [fk_pool_arrival_pool] FOREIGN KEY ([pool_id]) REFERENCES [cltp].[pool] ([pool_id]) ON DELETE CASCADE ON UPDATE CASCADE
GO


-- ----------------------------
-- Foreign Keys structure for table result
-- ----------------------------
ALTER TABLE [cltp].[result] ADD CONSTRAINT [fk_result_pcr_plate] FOREIGN KEY ([pcr_plate_id]) REFERENCES [cltp].[pcr_plate] ([pcr_plate_id]) ON DELETE CASCADE ON UPDATE CASCADE
GO


-- ----------------------------
-- Foreign Keys structure for table result_entry
-- ----------------------------
ALTER TABLE [cltp].[result_entry] ADD CONSTRAINT [fk_result_entry_result] FOREIGN KEY ([result_id]) REFERENCES [cltp].[result] ([id]) ON DELETE CASCADE ON UPDATE CASCADE
GO


-- ----------------------------
-- Foreign Keys structure for table sample
-- ----------------------------
ALTER TABLE [cltp].[sample] ADD CONSTRAINT [fk_sample_staff] FOREIGN KEY ([staff_id]) REFERENCES [cltp].[staff] ([staff_id]) ON DELETE CASCADE ON UPDATE CASCADE
GO

