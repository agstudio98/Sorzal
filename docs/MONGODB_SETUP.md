# Instrucciones de Configuración del Servidor MongoDB (Sorzal)

Para garantizar la estabilidad y aislamiento del proyecto, sigue estos pasos para configurar la instancia independiente de MongoDB. 

**Nota:** Estos comandos requieren privilegios de `sudo`.

### 1. Crear directorios de datos y logs
```bash
sudo mkdir -p /var/lib/mongodb/Sorzal
sudo chown -R mongodb:mongodb /var/lib/mongodb/Sorzal
sudo chmod -R 755 /var/lib/mongodb/Sorzal
```

### 2. Crear archivo de configuración
Crea el archivo `/etc/mongod-Sorzal.conf` con el siguiente contenido:
```yaml
storage:
  dbPath: /var/lib/mongodb/Sorzal
systemLog:
  destination: file
  path: /var/log/mongodb/Sorzal.log
  logAppend: true
net:
  port: 27020
  bindIp: 127.0.0.1
processManagement:
  pidFilePath: /var/run/mongodb/mongod-Sorzal.pid
  fork: true
```

### 3. Crear el servicio systemd
Crea el archivo `/etc/systemd/system/mongod-Sorzal.service`:
```ini
[Unit]
Description=MongoDB Sorzal Instance
After=network.target

[Service]
User=mongodb
Group=mongodb
ExecStart=/usr/bin/mongod --config /etc/mongod-Sorzal.conf
PIDFile=/var/run/mongodb/mongod-Sorzal.pid
Restart=always

[Install]
WantedBy=multi-user.target
```

### 4. Activar el servicio
```bash
sudo systemctl daemon-reload
sudo systemctl enable mongod-Sorzal
sudo systemctl start mongod-Sorzal
```

### 5. Verificar estado
```bash
sudo systemctl status mongod-Sorzal
```

Una vez activo, el Backend de Sorzal podrá conectarse a `mongodb://localhost:27017/sorzal` sin interferir con otras bases de datos.
