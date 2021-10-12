ALTER TABLE [cltp].[connection_plate_pcr_plate] ADD CONSTRAINT [PK__connecti__2AB1E8A7180368C9] PRIMARY KEY CLUSTERED ([plate_id], [pcr_plate_id], [coordinate])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
ON [PRIMARY]
GO

ALTER TABLE [cltp].[connection_pool_rack] ADD CONSTRAINT [PK__connecti__07D800CE21BC3B7C] PRIMARY KEY CLUSTERED ([pool_id], [rack_id], [coordinate])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
ON [PRIMARY]
GO

ALTER TABLE [cltp].[connection_pool_sample] ALTER COLUMN [technician] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL
GO

ALTER TABLE [cltp].[connection_pool_sample] ALTER COLUMN [source] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO

ALTER TABLE [cltp].[connection_pool_sample] ALTER COLUMN [comment] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO

ALTER TABLE [cltp].[connection_rack_plate] ADD CONSTRAINT [PK__connecti__DD1A95DC4822EDD9] PRIMARY KEY CLUSTERED ([rack_id], [plate_id], [coordinate])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
ON [PRIMARY]
GO

CREATE TABLE [cltp].[interpretation_exported] (
  [id] uniqueidentifier  NOT NULL,
  [interpretation_id] uniqueidentifier  NOT NULL,
  [creation_timestamp] datetime DEFAULT getdate() NOT NULL,
  CONSTRAINT [PK__interpre__3213E83FE41F04F2] PRIMARY KEY CLUSTERED ([id])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
ON [PRIMARY]
)
ON [PRIMARY]
GO

ALTER TABLE [cltp].[interpretation_exported] SET (LOCK_ESCALATION = TABLE)
GO

ALTER TABLE [cltp].[pool_arrival] ALTER COLUMN [source] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO

ALTER TABLE [cltp].[pool_arrival] ALTER COLUMN [comment] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO

ALTER TABLE [cltp].[probe_order] ALTER COLUMN [comment] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO

ALTER TABLE [cltp].[probe_order] ALTER COLUMN [unternehmen_key] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL
GO

ALTER TABLE [cltp].[probe_order] ALTER COLUMN [unternehmen_uid] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO

ALTER TABLE [cltp].[probe_order] ALTER COLUMN [unternehmen_typ] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO

ALTER TABLE [cltp].[probe_order] ALTER COLUMN [unternehmen_name] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO

ALTER TABLE [cltp].[probe_order] ALTER COLUMN [unternehmen_abteilung] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO

ALTER TABLE [cltp].[probe_order] ALTER COLUMN [unternehmen_ort] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO

ALTER TABLE [cltp].[probe_order] ALTER COLUMN [unternehmen_postleitzahl] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO

ALTER TABLE [cltp].[probe_order] ALTER COLUMN [unternehmen_strasse] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO

ALTER TABLE [cltp].[probe_order] ALTER COLUMN [unternehmen_email] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO

ALTER TABLE [cltp].[probe_order] ALTER COLUMN [unternehmen_telefon_geschaeft] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO

ALTER TABLE [cltp].[probe_order] ALTER COLUMN [unternehmen_telefon_mobil] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO

ALTER TABLE [cltp].[probe_order] ALTER COLUMN [poolmanager_nachname] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO

ALTER TABLE [cltp].[probe_order] ALTER COLUMN [poolmanager_vorname] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO

ALTER TABLE [cltp].[probe_order] ALTER COLUMN [barcode_nummer] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL
GO

ALTER TABLE [cltp].[result] DROP COLUMN [raw]
GO

ALTER TABLE [cltp].[result_entry] DROP COLUMN [raw]
GO

ALTER TABLE [cltp].[staff] ALTER COLUMN [title] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO

ALTER TABLE [cltp].[staff] ALTER COLUMN [first_name] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO

ALTER TABLE [cltp].[staff] ALTER COLUMN [last_name] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO

ALTER TABLE [cltp].[staff] ALTER COLUMN [email] varchar(max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
GO

ALTER VIEW [cltp].[internal_probe_result] AS SELECT 'unternehmen_key' AS unternehmen_key,
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

CREATE VIEW [cltp].[interpretation_pending] AS SELECT cltp.interpretation.* FROM (cltp.interpretation LEFT JOIN cltp.interpretation_exported ON cltp.interpretation.id = cltp.interpretation_exported.interpretation_id)
WHERE cltp.interpretation_exported.id IS NULL;
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


ALTER VIEW [cltp].[mapping] AS SELECT cltp.pcr_plate.pcr_plate_id,
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

CREATE VIEW [cltp].[pcr_plate_ready] AS SELECT cltp.pcr_plate.* FROM (cltp.pcr_plate LEFT JOIN cltp.result ON cltp.pcr_plate.pcr_plate_id = cltp.result.pcr_plate_id)
WHERE cltp.result.pcr_plate_id IS NULL;
GO

CREATE VIEW [cltp].[plate_ready] AS SELECT cltp.plate.* FROM (cltp.plate LEFT JOIN cltp.connection_plate_pcr_plate ON cltp.plate.plate_id = cltp.connection_plate_pcr_plate.plate_id)
WHERE cltp.connection_plate_pcr_plate.plate_id IS NULL;
GO

CREATE VIEW [cltp].[pool_ready] AS SELECT cltp.pool.* FROM (cltp.pool LEFT JOIN cltp.connection_pool_rack ON cltp.pool.pool_id = cltp.connection_pool_rack.pool_id)
WHERE cltp.connection_pool_rack.pool_id IS NULL;
GO

CREATE VIEW [cltp].[probe_order_ready] AS SELECT cltp.probe_order.* FROM (cltp.probe_order LEFT JOIN cltp.pool ON cltp.probe_order.barcode_nummer = cltp.pool.pool_id)
WHERE cltp.pool.pool_id IS NULL;
GO

ALTER VIEW [cltp].[probe_result] AS SELECT cltp.probe_order.unternehmen_key,
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

CREATE VIEW [cltp].[rack_ready] AS SELECT cltp.rack.* FROM (cltp.rack LEFT JOIN cltp.connection_rack_plate ON (cltp.rack.rack_id = cltp.connection_rack_plate.rack_id AND cltp.rack.i = cltp.connection_rack_plate.rack_i))
WHERE cltp.connection_rack_plate.rack_id IS NULL;
GO

CREATE VIEW [cltp].[sample_ready] AS SELECT cltp.sample.* FROM (cltp.sample LEFT JOIN cltp.connection_pool_sample ON cltp.sample.sample_id = cltp.connection_pool_sample.sample_id)
WHERE cltp.connection_pool_sample.sample_id IS NULL;
GO

ALTER VIEW [cltp].[unused_rack] AS SELECT cltp.rack.rack_id,
    cltp.rack.creation_timestamp,
    cltp.rack.i,
    cltp.connection_rack_plate.plate_id
   FROM (cltp.rack
     LEFT JOIN cltp.connection_rack_plate ON ((((cltp.rack.rack_id) = (cltp.connection_rack_plate.rack_id)) AND (cltp.rack.i = cltp.connection_rack_plate.rack_i))))
  WHERE (cltp.connection_rack_plate.plate_id IS NULL);


CREATE TABLE [cltp].[audit_log] (
  [id] bigint IDENTITY NOT NULL,
  [type] varchar(64) NOT NULL,
  [ref] varchar(64) NOT NULL,
  [actor] varchar(64) NOT NULL,
  [message] varchar(max) NOT NULL,
  [creation_timestamp] datetime DEFAULT getdate() NOT NULL,
  PRIMARY KEY CLUSTERED ([id])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)
