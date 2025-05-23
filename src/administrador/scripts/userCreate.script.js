// userCreate.script.js
import { ref, onMounted } from 'vue';
import UserApiService from '../services/user-api.service';
import WebSocketService from '../../shared/websocket.service';

export default function useUserCreate() {
    const user = ref({
        dni: '',
        nombre: '',
        apePaterno: '',
        apeMaterno: '',
        ventanilla: '',
        password: '',
        area: null,
        rol: null
    });

    const dniError = ref(false);
    const areas = ref([]);
    const roles = ref(['Administrador', 'Recepcionista']);
    const showPassword = ref(false);

    const fetchAreas = async () => {
        try {
            const response = await UserApiService.getAreas();
            areas.value = areas.value.concat(response.data);
        } catch (error) {
            console.error('Error fetching areas:', error);
        }
    };

    onMounted(() => {
        fetchAreas();
    });

    const webSocketService = new WebSocketService();
    webSocketService.connect();

    const createUser = async () => {
        if (dniError.value) {
            return;
        }

        const requestData = {
            dni: user.value.dni,
            nombre: user.value.nombre,
            apePaterno: user.value.apePaterno,
            apeMaterno: user.value.apeMaterno,
            ventanilla: user.value.ventanilla,
            password: user.value.password,
            area: user.value.area,
            rol: user.value.rol
        };

        try {
            console.log('User data being sent:', requestData);
            const response = await UserApiService.createUser(requestData);
            const newUser = response.data;

            user.value.id = newUser.id;
            user.value.dni = newUser.dni;
            user.value.nombre = newUser.nombre;
            user.value.apePaterno = newUser.apePaterno;
            user.value.apeMaterno = newUser.apeMaterno;
            user.value.ventanilla = newUser.ventanilla;
            user.value.password = newUser.password;
            user.value.area = newUser.area;
            user.value.rol = newUser.rol;

            console.log('User created successfully');

            webSocketService.sendMessage(JSON.stringify({ event: 'userCreated', data: newUser }));
        } catch (error) {
            console.error('Error creating user:', error);
        }

        user.value.dni = '';
        user.value.ventanilla = '';
        user.value.password = '';
        user.value.area = null;
        user.value.rol = null;
    };

    const fetchUserData = async (dni) => {
        try {
            const response = await UserApiService.getUserDataByDni(dni);
            const data = response.data;
            user.value.nombre = data.nombres;
            user.value.apePaterno = data.apePaterno;
            user.value.apeMaterno = data.apeMaterno;
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const validateDNI = (event) => {
        const value = event.target.value;
        if (/^\d{0,9}$/.test(value)) {
            user.value.dni = value;
            dniError.value = false;
            if (value.length === 8 || value.length === 9) {
                fetchUserData(value);
            }
        } else {
            dniError.value = true;
        }
    };

    const validateVentanilla = (event) => {
        const regex = /^\d*$/;
        if (!regex.test(event.target.value)) {
            user.value.ventanilla = event.target.value.replace(/\D/g, '');
        }
    };

    const toggleShowPassword = () => {
        showPassword.value = !showPassword.value;
    };

    return {
        user,
        dniError,
        areas,
        roles,
        fetchAreas,
        webSocketService,
        createUser,
        fetchUserData,
        validateDNI,
        validateVentanilla,
        showPassword,
        toggleShowPassword
    };
}