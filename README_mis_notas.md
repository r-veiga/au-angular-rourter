## Dos proyectos
Este curso sobre Angular Router tiene dos proyectos como punto de inicio: 
1. Un proyecto Angular (frontend)
2. Un proyecto de backend, un API en Node.js

## Arrancando los proyectos 
```shell
npm start 
npm run server
```
1. El primer comando arranca el proyecto Angular por el puerto 4200 
2. El segundo comando arranca la API de backend por el puerto 9000 

```shell
http://localhost:4200
http://localhost:9000/api/courses
```

Un detalle a tener en cuenta es que `npm start` en realidad arranca el comando `ng serve  --proxy-config ./proxy.json`

Estamos empleando un fichero `proxy`



