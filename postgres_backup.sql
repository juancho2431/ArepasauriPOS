--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8 (Ubuntu 16.8-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.8 (Ubuntu 16.8-0ubuntu0.24.04.1)

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
-- Name: bebidas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bebidas (
    bebida_id integer NOT NULL,
    name character varying(255) NOT NULL,
    stock integer NOT NULL,
    price integer NOT NULL
);


ALTER TABLE public.bebidas OWNER TO postgres;

--
-- Name: bebidas_bebida_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bebidas_bebida_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bebidas_bebida_id_seq OWNER TO postgres;

--
-- Name: bebidas_bebida_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bebidas_bebida_id_seq OWNED BY public.bebidas.bebida_id;


--
-- Name: empleados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empleados (
    empleado_id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    apellido character varying(255) NOT NULL,
    rol character varying(255) NOT NULL,
    usuario character varying(255) NOT NULL,
    "contraseña" character varying(255) NOT NULL
);


ALTER TABLE public.empleados OWNER TO postgres;

--
-- Name: empleados_empleado_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.empleados_empleado_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.empleados_empleado_id_seq OWNER TO postgres;

--
-- Name: empleados_empleado_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.empleados_empleado_id_seq OWNED BY public.empleados.empleado_id;


--
-- Name: ingredients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ingredients (
    ingredient_id integer NOT NULL,
    name character varying(255) NOT NULL,
    stock_current double precision NOT NULL,
    stock_minimum double precision NOT NULL
);


ALTER TABLE public.ingredients OWNER TO postgres;

--
-- Name: ingredients_ingredient_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ingredients_ingredient_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ingredients_ingredient_id_seq OWNER TO postgres;

--
-- Name: ingredients_ingredient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ingredients_ingredient_id_seq OWNED BY public.ingredients.ingredient_id;


--
-- Name: producto_ingredients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producto_ingredients (
    producto_id integer NOT NULL,
    ingredient_id integer NOT NULL,
    amount double precision NOT NULL
);


ALTER TABLE public.producto_ingredients OWNER TO postgres;

--
-- Name: productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productos (
    producto_id integer NOT NULL,
    name character varying(255) NOT NULL,
    price integer NOT NULL
);


ALTER TABLE public.productos OWNER TO postgres;

--
-- Name: productos_producto_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.productos_producto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.productos_producto_id_seq OWNER TO postgres;

--
-- Name: productos_producto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.productos_producto_id_seq OWNED BY public.productos.producto_id;


--
-- Name: venta_detalles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.venta_detalles (
    venta_detalle_id integer NOT NULL,
    venta_id integer NOT NULL,
    tipo_producto character varying(255) NOT NULL,
    producto_id integer,
    bebida_id integer,
    cantidad integer NOT NULL,
    precio integer NOT NULL
);


ALTER TABLE public.venta_detalles OWNER TO postgres;

--
-- Name: venta_detalles_venta_detalle_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.venta_detalles_venta_detalle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.venta_detalles_venta_detalle_id_seq OWNER TO postgres;

--
-- Name: venta_detalles_venta_detalle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.venta_detalles_venta_detalle_id_seq OWNED BY public.venta_detalles.venta_detalle_id;


--
-- Name: ventas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ventas (
    ventas_id integer NOT NULL,
    fecha timestamp with time zone NOT NULL,
    total double precision NOT NULL,
    cliente character varying(255),
    metodo_pago character varying(255),
    vendedor_id integer
);


ALTER TABLE public.ventas OWNER TO postgres;

--
-- Name: ventas_ventas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ventas_ventas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ventas_ventas_id_seq OWNER TO postgres;

--
-- Name: ventas_ventas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ventas_ventas_id_seq OWNED BY public.ventas.ventas_id;


--
-- Name: bebidas bebida_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bebidas ALTER COLUMN bebida_id SET DEFAULT nextval('public.bebidas_bebida_id_seq'::regclass);


--
-- Name: empleados empleado_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados ALTER COLUMN empleado_id SET DEFAULT nextval('public.empleados_empleado_id_seq'::regclass);


--
-- Name: ingredients ingredient_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredients ALTER COLUMN ingredient_id SET DEFAULT nextval('public.ingredients_ingredient_id_seq'::regclass);


--
-- Name: productos producto_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos ALTER COLUMN producto_id SET DEFAULT nextval('public.productos_producto_id_seq'::regclass);


--
-- Name: venta_detalles venta_detalle_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.venta_detalles ALTER COLUMN venta_detalle_id SET DEFAULT nextval('public.venta_detalles_venta_detalle_id_seq'::regclass);


--
-- Name: ventas ventas_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas ALTER COLUMN ventas_id SET DEFAULT nextval('public.ventas_ventas_id_seq'::regclass);


--
-- Data for Name: bebidas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bebidas (bebida_id, name, stock, price) FROM stdin;
1	Coca-cola	7	3000
2	Coca-cola 500ml	36	4000
4	Coca-cola 1.5L	10	7000
5	Quatro 1.5L	4	6000
6	Quatro 400ml	10	3000
7	Jugo Del Valle	8	3000
8	Agua brisa 1L	6	3000
9	Agua Brisa limon	8	3000
10	Agua Brisa maracuya	12	3000
11	Jugo DV 1.5L	6	6000
12	cerveza andina	30	3000
13	Cerveza Heineken	30	4000
14	Andina refajo	20	3000
15	3Cordilleras rosa	1	7000
16	3Cordilleras blanca	8	7000
17	3Cordilleras mestiza	4	7000
19	3Cordilleras negra	8	7000
20	Bretaña alcohol	5	5000
21	Agua cristal	30	2000
22	Agua gas	30	2000
23	Bretaña	20	3000
24	Natu malta	24	3500
25	H2O 	20	3000
27	Aqua	12	2000
28	Te hatsu	20	5000
29	Hatsu soda	12000	4000
30	Jugo Hit	40	4000
31	Gatorade	25	4500
32	Mr tea 300ml	20	3000
33	Speed max	12	2000
34	Gaseosa Pb 1.5L 	24	6000
35	Refajo 1.5L	12	6000
36	Jugo Hit 1.5L	9	6000
37	Tinto	100	2000
38	Tinto especial	100	1700
39	Latte	100	2500
40	Aromatica	100	1500
42	Milo	50	4000
43	Vaso Leche	50	4000
3	Coca-cola 1L	15	5000
41	Capuccino	98	3000
26	Gaseosa 400ml	55	3000
\.


--
-- Data for Name: empleados; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.empleados (empleado_id, nombre, apellido, rol, usuario, "contraseña") FROM stdin;
1	Danna	Cortes	Cajero	danna.cortes	1tdu1nh9
2	Ingrid	Huertas	Cajero	ingrid.huertas	kxhqvbsy
3	Oscar	Cortes	Cajero	oscar.cortes	i2vpl9ft
\.


--
-- Data for Name: ingredients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ingredients (ingredient_id, name, stock_current, stock_minimum) FROM stdin;
11	Carne artesanal	9	4
14	Tomate	26	6
15	Lechuga	19	5
13	Cebolla grillé	15.5	4
18	Carne pincho	15	5
19	Bocadillo	150	10
20	Salchicha	32	10
1	Chorizo	3	1
3	Huevo	116	30
2	Arepa	86	1
6	Queso	69	20
17	Mazorca	850	100
8	Tocineta	35	5
4	Carne res	7	5
10	Cerdo	16	5
5	Pollo	7	5
16	Madurito	1	1
7	Jamon	98	20
9	Huevo codorniz	84	12
\.


--
-- Data for Name: producto_ingredients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.producto_ingredients (producto_id, ingredient_id, amount) FROM stdin;
1	1	1
1	2	1
2	2	1
2	6	2
2	8	1
2	11	1
2	14	2
2	15	1
2	13	0.25
7	2	1
7	10	1
7	1	0.5
7	6	1
7	8	1
7	9	2
8	2	1
8	5	0.5
8	4	0.5
8	16	1
8	6	1
8	8	1
8	9	2
9	2	1
9	4	0.5
9	5	0.5
9	10	0.5
9	1	0.5
9	16	1
9	17	50
9	8	1
9	6	1
9	9	2
10	2	1
10	4	0.5
10	10	0.5
10	5	0.5
10	16	1
10	7	1
10	6	1
10	9	2
11	2	1
11	4	1
11	7	1
11	6	1
11	9	2
12	2	1
12	5	1
12	6	1
12	7	1
12	9	2
13	18	1
13	2	1
13	6	2
14	18	1
15	2	1
15	6	1
15	3	2
15	20	1
16	2	1
16	6	1
16	3	2
16	17	25
17	2	1
17	3	2
17	6	1
18	2	1
18	6	1
18	7	1
20	2	1
20	6	1
20	19	1
21	4	0.5
22	5	0.5
23	10	0.5
24	6	1
25	7	1
26	8	1
27	16	1
28	17	50
29	1	0.5
30	1	1
31	2	1
31	6	1
32	5	1
33	4	1
34	10	1
35	5	0.5
36	4	0.5
37	10	0.5
38	6	1
39	7	1
40	8	1
41	9	1
42	9	1
\.


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos (producto_id, name, price) FROM stdin;
2	Mosasaurio	19000
7	Triceratops	15000
8	Gigantosaurio	16000
9	Indominus	22000
10	T-rex	18000
11	Carnotauro	13000
12	Terodactilo	12000
13	Anquilosaurio	12000
14	Pincho individual	8000
15	Velociraptor	8000
16	Spinosaurio	8000
17	Brontosaurio	7000
18	Stegosaurio	5000
20	Iguanodon	6000
25	Adn jamon	1000
26	Adn tocineta	1500
24	Adn queso	1000
23	Adn cerdo	4000
22	Adn pollo	4000
21	Adn res	4000
27	Adn madurito	2000
28	Adn mazorca	3000
29	Adn 1/2 chorizo	2500
30	Chorizo unidad	5000
31	Aliosaurio	4000
32	Cambio pollo	1
33	Cambio res	1
34	Cambio cerdo	1
35	Cambio 1/2 pollo	1
36	Cambio 1/2 res	1
37	Cambio1/2 cerdo	1
38	Cambio queso	1
39	Cambio jamon	1
40	Cambio tocineta	1
41	Cambio H.codorniz	1
42	Adc H.codorniz	500
1	Coritosaurio	7000
\.


--
-- Data for Name: venta_detalles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.venta_detalles (venta_detalle_id, venta_id, tipo_producto, producto_id, bebida_id, cantidad, precio) FROM stdin;
1	1	bebida	\N	1	1	3000
2	1	producto	1	\N	1	8000
3	2	producto	1	\N	1	8000
4	3	producto	2	\N	1	19000
5	3	bebida	\N	1	1	3000
7	4	bebida	\N	1	1	3000
6	4	producto	\N	\N	1	22000
8	5	producto	9	\N	1	22000
9	5	producto	7	\N	1	15000
10	5	producto	10	\N	1	18000
11	6	producto	9	\N	1	22000
12	6	producto	10	\N	1	18000
13	6	bebida	\N	3	1	5000
14	7	producto	2	\N	1	19000
15	7	bebida	\N	41	1	3000
22	14	bebida	\N	41	1	3000
25	17	producto	31	\N	1	4000
26	17	producto	31	\N	1	4000
27	17	bebida	\N	26	1	3000
28	18	producto	24	\N	1	1000
29	18	producto	24	\N	1	1000
30	18	producto	1	\N	1	7000
31	18	producto	1	\N	1	7000
32	18	bebida	\N	26	1	3000
33	18	bebida	\N	26	1	3000
34	19	producto	1	\N	1	7000
35	19	producto	1	\N	1	7000
36	19	producto	24	\N	1	1000
37	19	bebida	\N	26	1	3000
38	19	bebida	\N	26	1	3000
39	20	producto	17	\N	1	7000
40	20	producto	17	\N	1	7000
41	21	producto	31	\N	1	4000
42	21	producto	31	\N	1	4000
43	21	producto	31	\N	1	4000
44	21	producto	24	\N	1	1000
45	21	producto	24	\N	1	1000
46	21	producto	24	\N	1	1000
47	22	producto	24	\N	1	1000
48	22	producto	24	\N	1	1000
49	22	producto	24	\N	1	1000
50	22	producto	31	\N	1	4000
51	22	producto	31	\N	1	4000
52	22	producto	31	\N	1	4000
\.


--
-- Data for Name: ventas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ventas (ventas_id, fecha, total, cliente, metodo_pago, vendedor_id) FROM stdin;
1	2025-05-02 01:52:36.36+00	11000	Juan Rodriguez	Efectivo	1
2	2025-05-02 02:28:22.712+00	8000	felipe	Nequi	1
3	2025-05-02 18:04:30.966+00	22000	Felipe Ruiz	Nequi	1
4	2025-05-02 19:16:20.068+00	25000	Oscar Cortes	Efectivo	2
5	2025-05-03 01:11:36.161+00	55000	x	Efectivo	1
6	2025-05-05 18:24:05.028+00	45000	diego	Efectivo	1
7	2025-05-06 16:14:16.38+00	22000	DANNA CORTES	Nequi	2
14	2025-05-06 22:50:51.316+00	3000	danna	Efectivo	1
17	2025-05-06 22:53:23.115+00	11000	mostrador	Efectivo	1
18	2025-05-06 22:55:38.015+00	22000	Mostrador	Efectivo	1
19	2025-05-06 22:58:10.765+00	21000	danna	Efectivo	1
20	2025-05-06 23:48:59.231+00	14000	xxxx	Daviplata	3
21	2025-05-06 23:52:48.103+00	15000	xyz	Efectivo	3
22	2025-05-06 23:54:52.022+00	15000	x	Efectivo	2
\.


--
-- Name: bebidas_bebida_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bebidas_bebida_id_seq', 43, true);


--
-- Name: empleados_empleado_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.empleados_empleado_id_seq', 3, true);


--
-- Name: ingredients_ingredient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ingredients_ingredient_id_seq', 21, true);


--
-- Name: productos_producto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productos_producto_id_seq', 42, true);


--
-- Name: venta_detalles_venta_detalle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.venta_detalles_venta_detalle_id_seq', 52, true);


--
-- Name: ventas_ventas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ventas_ventas_id_seq', 22, true);


--
-- Name: bebidas bebidas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bebidas
    ADD CONSTRAINT bebidas_pkey PRIMARY KEY (bebida_id);


--
-- Name: empleados empleados_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_pkey PRIMARY KEY (empleado_id);


--
-- Name: empleados empleados_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_usuario_key UNIQUE (usuario);


--
-- Name: ingredients ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_pkey PRIMARY KEY (ingredient_id);


--
-- Name: producto_ingredients producto_ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_ingredients
    ADD CONSTRAINT producto_ingredients_pkey PRIMARY KEY (producto_id, ingredient_id);


--
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (producto_id);


--
-- Name: venta_detalles venta_detalles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.venta_detalles
    ADD CONSTRAINT venta_detalles_pkey PRIMARY KEY (venta_detalle_id);


--
-- Name: ventas ventas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_pkey PRIMARY KEY (ventas_id);


--
-- Name: producto_ingredients producto_ingredients_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_ingredients
    ADD CONSTRAINT producto_ingredients_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(ingredient_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: producto_ingredients producto_ingredients_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_ingredients
    ADD CONSTRAINT producto_ingredients_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: venta_detalles venta_detalles_bebida_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.venta_detalles
    ADD CONSTRAINT venta_detalles_bebida_id_fkey FOREIGN KEY (bebida_id) REFERENCES public.bebidas(bebida_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: venta_detalles venta_detalles_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.venta_detalles
    ADD CONSTRAINT venta_detalles_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: venta_detalles venta_detalles_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.venta_detalles
    ADD CONSTRAINT venta_detalles_venta_id_fkey FOREIGN KEY (venta_id) REFERENCES public.ventas(ventas_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ventas ventas_vendedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_vendedor_id_fkey FOREIGN KEY (vendedor_id) REFERENCES public.empleados(empleado_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

