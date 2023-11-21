const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const app = express();

// Conexión a la base de datos de Joomla
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345',
  database: 'innovadb'
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs'); // Configuración correcta del motor de vistas

app.get('/login', (req, res) => {
  res.render('login', { error: '' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  connection.query('SELECT * FROM jdb_users WHERE username = ?', [username], (error, results) => {
    if (error) {
      return res.status(500).send('Error en el servidor');
    }

    if (results.length === 0) {
      return res.status(401).send('Usuario no encontrado');
    }

    const user = results[0];

    console.log("user ", user);

    // Comprobar la contraseña
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).send('Error al verificar la contraseña');
      }

      console.log("isMatch", isMatch);
      if (isMatch) {
        // Consultar la tabla jdb_user_usergroup_map para obtener el group_id
        connection.query('SELECT * FROM jdb_user_usergroup_map WHERE user_id = ?', [user.id], (error, results) => {
          if (error) {
            return res.status(500).send('Error en el servidor');
          }

          if (results.length === 0) {
            return res.status(401).send('No se encontró el rol del usuario');
          }

          const userRole = results[0].group_id;

          // Redirección basada en el group_id del usuario
          switch (userRole) {
            case 8:
              // app.get('/index', (req, res) => {
              //   res.render('index'); // Si estás usando EJS y tienes un archivo index.ejs en la carpeta views
              // });
              // res.redirect('/index');

              res.redirect('172.16.196.11');
              break;
            case 2:
              // app.get('/cliente', (req, res) => {
              //   res.render('cliente'); // Si estás usando EJS y tienes un archivo index.ejs en la carpeta views
              // });
              // res.redirect('/cliente');

              res.redirect('apps.in-nova.com.sv:8000');
              //res.redirect('/url-usuario-registrado'); // Reemplaza con la URL del usuario registrado
              break;
            default:
              res.redirect('/pagina-error'); // Reemplaza con la URL de la página de error
              break;
          }
        });
      } else {
        return res.status(401).send('Contraseña incorrecta');
      }
    });
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en el puerto${PORT}");
});

