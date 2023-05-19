import {
    Button,
    Form,
    Input,
    Select,
} from 'antd';
import React, {FC, useState} from 'react';
import {useTypedSelector} from "../../hooks/useTypedSelector";
import {AuthActionCreators} from "../../store/reducers/auth/action-creators";
import {useDispatch} from "react-redux";
import AuthService from "../../services/AuthService";
import {rules} from "../../utils/rules";
import ErrorMessage from "../ErrorMessage";
import {errorState, infoState} from "./type";


const InformationForm: FC = () => {
    const [componentDisabled, setComponentDisabled] = useState<boolean>(true);
    const [isChanging, setIsChanging] = useState<boolean>(false);
    const [isPasswordChanging, setIsPasswordChanging] = useState<boolean>(false);
    const {user, darkTheme} = useTypedSelector(state => state.auth)
    const dispatch = useDispatch();

    const [error, setError] = useState<errorState>(
        {
            oldPasswordError: false
        }
    );
    const [info, setInfo] = useState<infoState>({
        email: user.email,
        name: user.name,
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        surname: user.surname,
        gender: user.gender,
        patronymic: user.patronymic
    })

    const saveInfo = async () => {
        if (isChanging) {
            try {
                await AuthService.updateUserInformation(info.email, info.name, info.surname, info.patronymic, info.gender);
                setComponentDisabled(true)
                setIsChanging(false)
            } catch (e) {
                console.log(e)
            }
        } else {
            setComponentDisabled(false)
            setIsChanging(true)
        }
    }

    const savePassword = async () => {
        try {
            const response = await AuthService.updateUserPassword(info.email, info.oldPassword, info.newPassword);

            if (!response) {
                setError({...error, oldPasswordError: true})
                throw new Error('Неверный старый пароль')
            }

            setInfo({...info, newPassword: '', oldPassword: '', confirmNewPassword: ''})
            setIsPasswordChanging(prev => !prev);
        } catch (e) {
            console.log(e)
        }
    }

    return (
        <div
            style={darkTheme ?
                {
                backgroundColor: '#222222',
                padding: ' 10px 10px 20px 10px',
                borderRadius: '10px',
                border: '1px solid gray'
        }
        : {
                    backgroundColor: '#ffffff',
                    padding: ' 10px 10px 20px 10px',
                    borderRadius: '10px',
                    border: '1px solid #c0c0c0'
                }}
        >
            <Form
                onFinish={saveInfo}
                layout="horizontal"
                style={{width: '400px'}}
            >
                <Form.Item
                    label="Имя:"
                    name="name"
                    initialValue={info.name}
                    rules={[rules.requerdWithDop(isChanging)]}
                >
                    {isChanging
                        ?
                    <Input
                        value={info.name}
                        disabled={componentDisabled}
                        onChange={(e) => setInfo({...info, name: e.target.value})}
                    />
                        :
                        <div>
                            {info.name}
                        </div>
                    }
                </Form.Item>
                <Form.Item
                    label="Фамилия:"
                    name="surname"
                    initialValue={info.surname}
                    rules={[rules.requerdWithDop(isChanging)]}
                >
                    {isChanging
                        ?
                        <Input
                            disabled={componentDisabled}
                            value={info.surname}
                            onChange={(e) => setInfo({...info, surname: e.target.value})}
                        />
                        :
                        <div>
                            {info.surname}
                        </div>
                    }
                </Form.Item>
                <Form.Item
                    label="Отчество:"
                    initialValue={info.patronymic}
                >
                    {isChanging
                        ?
                        <Input
                            disabled={componentDisabled}
                            value={info.patronymic}
                            onChange={(e) => setInfo({...info, patronymic: e.target.value})}
                        />
                        :
                            info.patronymic &&
                                <div>
                                    {info.patronymic}
                                </div>
                    }
                </Form.Item>
                <Form.Item
                    label="Пол:"
                >
                    {isChanging
                        ?
                        <Select
                            disabled={componentDisabled}
                            value={info.gender}
                            onChange={(gender: string) => setInfo({...info, gender: gender})}
                        >
                            <Select.Option value="Мусжкой">Мужской</Select.Option>
                            <Select.Option value="Женский">Женский</Select.Option>
                        </Select>
                        :
                        <div>
                            {info.gender}
                        </div>
                    }
                </Form.Item>
                <Form.Item
                    name="email"
                    label="E-mail:"
                    initialValue={info.email}
                    rules={[rules.requerdWithDop(isChanging)]}
                >
                    {isChanging
                        ?
                        <Input
                            value={info.email}
                            disabled={true}
                            onChange={(e) => setInfo({...info, email: e.target.value})}
                        />
                        :
                        <div>
                            {info.email}
                        </div>
                    }
                </Form.Item>
                <Form.Item>
                    <>
                        <Button htmlType="submit">
                            {isChanging ? 'Сохранить' : 'Изменить'}
                        </Button>
                        <Button
                            className={"ml10"}
                            onClick={() => {
                                dispatch(AuthActionCreators.setDarkTheme(!darkTheme))
                                localStorage.setItem('darkTheme', JSON.stringify(!darkTheme));
                            }
                        }
                        >
                            Сменить тему фона
                        </Button>
                        <Button
                            className="ml10"
                            onClick={() => AuthActionCreators.logout()(dispatch)}
                            danger
                        >
                            Выйти
                        </Button>
                    </>
                </Form.Item>
            </Form>
            <>
                {isPasswordChanging &&
                    <Form
                        onFinish={savePassword}
                        className="mt10"
                        style={{width: '400px'}}
                    >
                        <Form.Item
                            name="oldPassword"
                            initialValue={''}
                            rules={[rules.requerdWithDop(isChanging)]}
                        >
                            <Input.Password
                                placeholder="Введите старый пароль"
                                value={info.oldPassword}
                                onChange={(e) => {
                                    setInfo({...info, oldPassword: e.target.value})
                                    setError({...error, oldPasswordError: false})
                                }
                                }
                            />
                        </Form.Item>
                        <ErrorMessage
                            isError={error.oldPasswordError}
                            errorMessage="введен неверный старый пароль"
                            style={{color: 'red', marginTop: -25}}
                        />
                        <Form.Item
                            name="newPassword"
                            initialValue={''}
                            rules={[rules.requerdWithDop(isChanging)]}
                        >
                            <Input.Password
                                className="mt-20"
                                placeholder="Введите новый пароль"
                                value={info.newPassword}
                                onChange={(e) => {
                                    setInfo({...info, newPassword: e.target.value})
                                }
                                }
                            />
                        </Form.Item>
                        <Form.Item
                            name="confirmNewPassword"
                            dependencies={['newPassword']}
                            hasFeedback
                            rules={[
                                rules.requerdWithDop(isChanging),
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('пароли не совпадают'));
                                    },
                                }),
                            ]}
                            initialValue={''}
                        >
                            <Input.Password
                                className="mt-20"
                                placeholder="Подтвердите новый пароль"
                                value={info.confirmNewPassword}
                                onChange={(e) =>
                                    setInfo({...info, confirmNewPassword: e.target.value})
                                }
                            />
                        </Form.Item>
                        <Form.Item>
                                <Button
                                    className="mt-20"
                                    htmlType="submit"
                                >
                                    Сохранить изменения
                                </Button>
                        </Form.Item>
                    </Form>
                }
                <Button
                    onClick={() => setIsPasswordChanging(prev => !prev)}
                >
                    {isPasswordChanging ? 'Отменить изменения' : 'Изменить текущий пароль'}
                </Button>
            </>
        </div>
    );
};

export default InformationForm;