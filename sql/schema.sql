--
-- PostgreSQL database dump
--

-- Dumped from database version 13.4 (Debian 13.4-4.pgdg110+1)
-- Dumped by pg_dump version 13.4

-- Started on 2021-10-07 14:49:32 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 200 (class 1259 OID 33415)
-- Name: connection_plate_pcr_plate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.connection_plate_pcr_plate (
    plate_id character varying(64) NOT NULL,
    pcr_plate_id character varying(64) NOT NULL,
    coordinate character varying(64) NOT NULL,
    creation_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.connection_plate_pcr_plate OWNER TO postgres;

--
-- TOC entry 201 (class 1259 OID 33419)
-- Name: connection_pool_rack; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.connection_pool_rack (
    pool_id character varying(64) NOT NULL,
    rack_id character varying(64) NOT NULL,
    coordinate character varying(64) NOT NULL,
    creation_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    rack_i integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.connection_pool_rack OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 33611)
-- Name: connection_pool_sample; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.connection_pool_sample (
    pool_id character varying(64) NOT NULL,
    sample_id character varying(64) NOT NULL,
    technician text NOT NULL,
    source text,
    comment text,
    creation_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.connection_pool_sample OWNER TO postgres;

--
-- TOC entry 202 (class 1259 OID 33424)
-- Name: connection_rack_plate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.connection_rack_plate (
    rack_id character varying(64) NOT NULL,
    plate_id character varying(64) NOT NULL,
    coordinate character varying(64) NOT NULL,
    creation_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    rack_i integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.connection_rack_plate OWNER TO postgres;

--
-- TOC entry 203 (class 1259 OID 33429)
-- Name: interpretation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interpretation (
    id uuid NOT NULL,
    result_entry_id uuid NOT NULL,
    pool_id character varying(64) NOT NULL,
    interpretation text NOT NULL,
    creation_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.interpretation OWNER TO postgres;

--
-- TOC entry 206 (class 1259 OID 33444)
-- Name: pool; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pool (
    pool_id character varying(32) NOT NULL,
    creation_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.pool OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 33632)
-- Name: internal_probe_result; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.internal_probe_result AS
 SELECT 'unternehmen_key'::text AS unternehmen_key,
    'unternehmen_uid'::text AS unternehmen_uid,
    'unternehmen_typ'::text AS unternehmen_typ,
    'unternehmen_name'::text AS unternehmen_name,
    'unternehmen_abteilung'::text AS unternehmen_abteilung,
    'unternehmen_ort'::text AS unternehmen_ort,
    'unternehmen_postleitzahl'::text AS unternehmen_postleitzahl,
    'unternehmen_strasse'::text AS unternehmen_strasse,
    'unternehmen_email'::text AS unternehmen_email,
    'unternehmen_telefon_geschaeft'::text AS unternehmen_telefon_geschaeft,
    'unternehmen_telefon_mobil'::text AS unternehmen_telefon_mobil,
    'poolmanager_nachname'::text AS poolmanager_nachname,
    'poolmanager_vorname'::text AS poolmanager_vorname,
    pool.pool_id AS barcode_nummer,
    interpretation.creation_timestamp AS untersuchung_datum,
    interpretation.interpretation AS untersuchung_resultat,
    'Universitaetsspital Neuropathologie'::text AS untersuchung_absender
   FROM ((public.connection_pool_sample
     JOIN public.pool ON (((pool.pool_id)::text = (connection_pool_sample.pool_id)::text)))
     JOIN public.interpretation ON (((pool.pool_id)::text = (interpretation.pool_id)::text)));


ALTER TABLE public.internal_probe_result OWNER TO postgres;

--
-- TOC entry 204 (class 1259 OID 33436)
-- Name: pcr_plate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pcr_plate (
    pcr_plate_id character varying(64) NOT NULL,
    creation_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.pcr_plate OWNER TO postgres;

--
-- TOC entry 205 (class 1259 OID 33440)
-- Name: plate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plate (
    plate_id character varying(64) NOT NULL,
    creation_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.plate OWNER TO postgres;

--
-- TOC entry 207 (class 1259 OID 33448)
-- Name: rack; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rack (
    rack_id character varying(64) NOT NULL,
    creation_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    i integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.rack OWNER TO postgres;

--
-- TOC entry 208 (class 1259 OID 33453)
-- Name: mapping; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.mapping AS
 SELECT pcr_plate.pcr_plate_id,
    connection_plate_pcr_plate.coordinate AS plate_coordinate,
    plate.plate_id,
    connection_rack_plate.coordinate AS rack_coordinate,
    rack.rack_id,
    rack.i AS rack_i,
    connection_pool_rack.coordinate AS pool_coordinate,
    pool.pool_id
   FROM ((((((public.pcr_plate
     JOIN public.connection_plate_pcr_plate ON (((pcr_plate.pcr_plate_id)::text = (connection_plate_pcr_plate.pcr_plate_id)::text)))
     JOIN public.plate ON (((connection_plate_pcr_plate.plate_id)::text = (plate.plate_id)::text)))
     JOIN public.connection_rack_plate ON (((plate.plate_id)::text = (connection_rack_plate.plate_id)::text)))
     JOIN public.rack ON ((((connection_rack_plate.rack_id)::text = (rack.rack_id)::text) AND ((connection_rack_plate.rack_i)::text = (rack.i)::text))))
     JOIN public.connection_pool_rack ON ((((rack.rack_id)::text = (connection_pool_rack.rack_id)::text) AND ((rack.i)::text = (connection_pool_rack.rack_i)::text))))
     JOIN public.pool ON (((connection_pool_rack.pool_id)::text = (pool.pool_id)::text)));


ALTER TABLE public.mapping OWNER TO postgres;

--
-- TOC entry 209 (class 1259 OID 33458)
-- Name: pool_arrival; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pool_arrival (
    id uuid NOT NULL,
    pool_id character varying(64) NOT NULL,
    technician character varying(64) NOT NULL,
    source text,
    comment text,
    creation_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.pool_arrival OWNER TO postgres;

--
-- TOC entry 210 (class 1259 OID 33465)
-- Name: probe_order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.probe_order (
    id uuid NOT NULL,
    comment text,
    unternehmen_key text NOT NULL,
    unternehmen_uid text,
    unternehmen_typ text,
    unternehmen_name text,
    unternehmen_abteilung text,
    unternehmen_ort text,
    unternehmen_postleitzahl text,
    unternehmen_strasse text,
    unternehmen_email text,
    unternehmen_telefon_geschaeft text,
    unternehmen_telefon_mobil text,
    poolmanager_nachname text,
    poolmanager_vorname text,
    barcode_nummer text NOT NULL,
    creation_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.probe_order OWNER TO postgres;

--
-- TOC entry 211 (class 1259 OID 33472)
-- Name: probe_result; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.probe_result AS
 SELECT probe_order.unternehmen_key,
    probe_order.unternehmen_uid,
    probe_order.unternehmen_typ,
    probe_order.unternehmen_name,
    probe_order.unternehmen_abteilung,
    probe_order.unternehmen_ort,
    probe_order.unternehmen_postleitzahl,
    probe_order.unternehmen_strasse,
    probe_order.unternehmen_email,
    probe_order.unternehmen_telefon_geschaeft,
    probe_order.unternehmen_telefon_mobil,
    probe_order.poolmanager_nachname,
    probe_order.poolmanager_vorname,
    probe_order.barcode_nummer,
    interpretation.creation_timestamp AS untersuchung_datum,
    interpretation.interpretation AS untersuchung_resultat,
    'Universitaetsspital Neuropathologie'::text AS untersuchung_absender
   FROM (public.probe_order
     JOIN public.interpretation ON ((probe_order.barcode_nummer = (interpretation.pool_id)::text)));


ALTER TABLE public.probe_result OWNER TO postgres;

--
-- TOC entry 212 (class 1259 OID 33477)
-- Name: result; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.result (
    id uuid NOT NULL,
    pcr_plate_id character varying NOT NULL,
    raw text NOT NULL,
    creation_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.result OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 33484)
-- Name: result_entry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.result_entry (
    id uuid NOT NULL,
    result_id uuid NOT NULL,
    coordinate character varying(64) NOT NULL,
    n1n2_cq double precision,
    human_ic_cq double precision,
    raw text NOT NULL,
    creation_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.result_entry OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 33597)
-- Name: sample; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sample (
    sample_id character varying(64) NOT NULL,
    staff_id character varying(64) NOT NULL,
    creation_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sample OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 33586)
-- Name: staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff (
    staff_id character varying(64) NOT NULL,
    title text,
    first_name text,
    last_name text,
    email text,
    creation_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.staff OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 33491)
-- Name: unused_rack; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.unused_rack AS
 SELECT rack.rack_id,
    rack.creation_timestamp,
    rack.i,
    connection_rack_plate.plate_id
   FROM (public.rack
     LEFT JOIN public.connection_rack_plate ON ((((rack.rack_id)::text = (connection_rack_plate.rack_id)::text) AND (rack.i = connection_rack_plate.rack_i))))
  WHERE (connection_rack_plate.plate_id IS NULL);


ALTER TABLE public.unused_rack OWNER TO postgres;

--
-- TOC entry 2981 (class 2606 OID 33619)
-- Name: connection_pool_sample connection_pool_sample_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.connection_pool_sample
    ADD CONSTRAINT connection_pool_sample_pkey PRIMARY KEY (pool_id, sample_id);


--
-- TOC entry 2957 (class 2606 OID 33496)
-- Name: interpretation interpretation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interpretation
    ADD CONSTRAINT interpretation_pkey PRIMARY KEY (id);


--
-- TOC entry 2951 (class 2606 OID 33498)
-- Name: connection_pool_rack layout; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.connection_pool_rack
    ADD CONSTRAINT layout UNIQUE (pool_id, rack_id, rack_i, coordinate);


--
-- TOC entry 2961 (class 2606 OID 33500)
-- Name: pcr_plate pcr_plate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pcr_plate
    ADD CONSTRAINT pcr_plate_pkey PRIMARY KEY (pcr_plate_id);


--
-- TOC entry 2963 (class 2606 OID 33502)
-- Name: plate plate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plate
    ADD CONSTRAINT plate_pkey PRIMARY KEY (plate_id);


--
-- TOC entry 2969 (class 2606 OID 33504)
-- Name: pool_arrival pool_arrival_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pool_arrival
    ADD CONSTRAINT pool_arrival_pkey PRIMARY KEY (id);


--
-- TOC entry 2965 (class 2606 OID 33506)
-- Name: pool pool_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pool
    ADD CONSTRAINT pool_pkey PRIMARY KEY (pool_id);


--
-- TOC entry 2971 (class 2606 OID 33508)
-- Name: probe_order probe_order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.probe_order
    ADD CONSTRAINT probe_order_pkey PRIMARY KEY (id);


--
-- TOC entry 2967 (class 2606 OID 33510)
-- Name: rack rack_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rack
    ADD CONSTRAINT rack_pkey PRIMARY KEY (rack_id, i);


--
-- TOC entry 2975 (class 2606 OID 33512)
-- Name: result_entry result_entry_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.result_entry
    ADD CONSTRAINT result_entry_pkey PRIMARY KEY (id);


--
-- TOC entry 2973 (class 2606 OID 33514)
-- Name: result result_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.result
    ADD CONSTRAINT result_pkey PRIMARY KEY (id);


--
-- TOC entry 2979 (class 2606 OID 33602)
-- Name: sample sample_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample
    ADD CONSTRAINT sample_pkey PRIMARY KEY (sample_id);


--
-- TOC entry 2977 (class 2606 OID 33593)
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (staff_id);


--
-- TOC entry 2949 (class 2606 OID 33516)
-- Name: connection_plate_pcr_plate uq_connection_plate_pcr_plate; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.connection_plate_pcr_plate
    ADD CONSTRAINT uq_connection_plate_pcr_plate UNIQUE (plate_id, pcr_plate_id, coordinate);


--
-- TOC entry 2953 (class 2606 OID 33518)
-- Name: connection_pool_rack uq_connection_pool_rack; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.connection_pool_rack
    ADD CONSTRAINT uq_connection_pool_rack UNIQUE (pool_id, rack_id, rack_i, coordinate);


--
-- TOC entry 2955 (class 2606 OID 33520)
-- Name: connection_rack_plate uq_connection_rack_plate; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.connection_rack_plate
    ADD CONSTRAINT uq_connection_rack_plate UNIQUE (rack_id, rack_i, plate_id, coordinate);


--
-- TOC entry 2959 (class 2606 OID 33522)
-- Name: interpretation uq_interpretation_result_entry_pool; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interpretation
    ADD CONSTRAINT uq_interpretation_result_entry_pool UNIQUE (result_entry_id, pool_id, interpretation);


--
-- TOC entry 2982 (class 2606 OID 33523)
-- Name: connection_plate_pcr_plate fk_connection_plate_pcr_plate_pcr_plate; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.connection_plate_pcr_plate
    ADD CONSTRAINT fk_connection_plate_pcr_plate_pcr_plate FOREIGN KEY (pcr_plate_id) REFERENCES public.pcr_plate(pcr_plate_id) ON DELETE CASCADE;


--
-- TOC entry 2983 (class 2606 OID 33528)
-- Name: connection_plate_pcr_plate fk_connection_plate_pcr_plate_plate; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.connection_plate_pcr_plate
    ADD CONSTRAINT fk_connection_plate_pcr_plate_plate FOREIGN KEY (plate_id) REFERENCES public.plate(plate_id) ON DELETE CASCADE;


--
-- TOC entry 2984 (class 2606 OID 33533)
-- Name: connection_pool_rack fk_connection_pool_rack_pool; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.connection_pool_rack
    ADD CONSTRAINT fk_connection_pool_rack_pool FOREIGN KEY (pool_id) REFERENCES public.pool(pool_id) ON DELETE CASCADE;


--
-- TOC entry 2985 (class 2606 OID 33538)
-- Name: connection_pool_rack fk_connection_pool_rack_rack; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.connection_pool_rack
    ADD CONSTRAINT fk_connection_pool_rack_rack FOREIGN KEY (rack_id, rack_i) REFERENCES public.rack(rack_id, i) ON DELETE CASCADE;


--
-- TOC entry 2994 (class 2606 OID 33620)
-- Name: connection_pool_sample fk_connection_pool_sample_pool; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.connection_pool_sample
    ADD CONSTRAINT fk_connection_pool_sample_pool FOREIGN KEY (pool_id) REFERENCES public.pool(pool_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2995 (class 2606 OID 33625)
-- Name: connection_pool_sample fk_connection_pool_sample_sampl; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.connection_pool_sample
    ADD CONSTRAINT fk_connection_pool_sample_sampl FOREIGN KEY (sample_id) REFERENCES public.sample(sample_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2986 (class 2606 OID 33543)
-- Name: connection_rack_plate fk_connection_rack_plate_plate; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.connection_rack_plate
    ADD CONSTRAINT fk_connection_rack_plate_plate FOREIGN KEY (plate_id) REFERENCES public.plate(plate_id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- TOC entry 2987 (class 2606 OID 33548)
-- Name: connection_rack_plate fk_connection_rack_plate_rack; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.connection_rack_plate
    ADD CONSTRAINT fk_connection_rack_plate_rack FOREIGN KEY (rack_id, rack_i) REFERENCES public.rack(rack_id, i) ON DELETE CASCADE;


--
-- TOC entry 2988 (class 2606 OID 33553)
-- Name: interpretation fk_interpretation_pool; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interpretation
    ADD CONSTRAINT fk_interpretation_pool FOREIGN KEY (pool_id) REFERENCES public.pool(pool_id) ON DELETE CASCADE;


--
-- TOC entry 2989 (class 2606 OID 33558)
-- Name: interpretation fk_interpretation_result; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interpretation
    ADD CONSTRAINT fk_interpretation_result FOREIGN KEY (result_entry_id) REFERENCES public.result_entry(id) ON DELETE CASCADE;


--
-- TOC entry 2990 (class 2606 OID 33563)
-- Name: pool_arrival fk_pool_arrival_pool; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pool_arrival
    ADD CONSTRAINT fk_pool_arrival_pool FOREIGN KEY (pool_id) REFERENCES public.pool(pool_id) ON DELETE CASCADE;


--
-- TOC entry 2992 (class 2606 OID 33568)
-- Name: result_entry fk_result_entry_result; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.result_entry
    ADD CONSTRAINT fk_result_entry_result FOREIGN KEY (result_id) REFERENCES public.result(id) ON DELETE CASCADE;


--
-- TOC entry 2991 (class 2606 OID 33573)
-- Name: result fk_result_pcr_plate; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.result
    ADD CONSTRAINT fk_result_pcr_plate FOREIGN KEY (pcr_plate_id) REFERENCES public.pcr_plate(pcr_plate_id) ON DELETE CASCADE;


--
-- TOC entry 2993 (class 2606 OID 33603)
-- Name: sample fk_sample_staff; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sample
    ADD CONSTRAINT fk_sample_staff FOREIGN KEY (staff_id) REFERENCES public.staff(staff_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3135 (class 0 OID 0)
-- Dependencies: 216
-- Name: TABLE sample; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT ON TABLE public.sample TO anonymous;


-- Completed on 2021-10-07 14:49:32 UTC

--
-- PostgreSQL database dump complete
--

