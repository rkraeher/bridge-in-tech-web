import React from 'react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, fireEvent, screen, waitForElement } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from "../login/Login";
import { act } from 'react-dom/test-utils';
import { BASE_API } from "../config";

const server = setupServer(
    rest.post(`${BASE_API}/login`, (req, res, ctx) => {
        req.body = {
            username: "MyUsername",
            password: "12345678",
        };
        return res(ctx.json({ 
            access_token: "fake_access_token",
            access_expiry: 1594771200
        }))
    })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())



it('allows the user to login successfully', async () => {
    render(<Login />)

    fireEvent.change(screen.getByPlaceholderText('Username or Email'), {
        target: { value: 'MyUsername' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: '12345678' },
    })
    expect(screen.queryByLabelText("errorMessage")).not.toBeInTheDocument();
    
    act(() => {
        fireEvent.click(screen.getByRole('button', { name: "Login" }), {
            target: { value: 'true' },
        })
    });
    expect(screen.queryByLabelText("errorMessage")).not.toBeInTheDocument();
})

it('handles wrong credentials', async () => {
    server.use(
      rest.post(`${BASE_API}/login`, (req, res, ctx) => {
        const wrongPayload = {
            username: "MyUsername",
            password: "87654321",
        };
        expect(req.body).toEqual(wrongPayload)
        return res(ctx.status(401), ctx.json({message: 'Username or password is wrong.'}))
      }),
    )
   
    render(<Login />)
   
    fireEvent.change(screen.getByPlaceholderText('Username or Email'), {
        target: { value: 'MyUsername' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: '87654321' },
    })
    expect(screen.queryByLabelText("errorMessage")).not.toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: "Login" }), {
        target: { value: 'true' },
    })

    await waitForElement(() => screen.getByLabelText('errorMessage'))
    
    expect(screen.getByLabelText('errorMessage')).toHaveTextContent("Username or password is wrong.")
  })

  it('handles server down', async () => {
    server.use(
      rest.post(`${BASE_API}/login`, (req, res, ctx) => {
        const wrongPayload = {
            username: "MyUsername",
            password: "87654321",
        };
        expect(req.body).toEqual(wrongPayload)
        return res(ctx.status(500), ctx.json({message: 'The server is currently unavailable. Try again later'}))
      }),
    )
   
    render(<Login />)
   
    fireEvent.change(screen.getByPlaceholderText('Username or Email'), {
        target: { value: 'MyUsername' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: '87654321' },
    })
    expect(screen.queryByLabelText("errorMessage")).not.toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: "Login" }), {
        target: { value: 'true' },
    })

    await waitForElement(() => screen.getByLabelText('errorMessage'))
    
    expect(screen.getByLabelText('errorMessage')).toHaveTextContent("The server is currently unavailable. Try again later")
  })

it('checks if the fields are empty', async () => {

    render(<Login />)

    fireEvent.change(screen.getByLabelText("Username or Email:", {selector: "input"}), {target: { value: "" }})
    
    fireEvent.change(screen.getByLabelText("Password :", {selector: "input"}), {target: { value: "" }})

    act(() => {
        fireEvent.click(screen.getByRole('button', { name: "Login" }), {
            target: { value: 'true' },
        })
    });
    
    expect(screen.getByLabelText("Username or Email:", {selector: "input"})).toBeRequired();
    
    expect(screen.getByLabelText("Password :", {selector: "input"})).toBeRequired();
})


it('handles password toggle', () => {
    render(<Login />)

    expect(screen.getByPlaceholderText('Password').type).toEqual("password")

    fireEvent.click(screen.getByLabelText('Show Password', { name: "show_password_checkbox" }), {
        target: { value: true },
    })
    
    expect(screen.getByPlaceholderText('Password').type).toEqual("text")
})

it('redirects user to Member Portfolio page on successful login', () => {
    render(<Login />)
    //Triggers handleSubmit function.
    act(() => {
        fireEvent.click(screen.getByRole('button', { name: "Login" }), {
            target: { value: 'true' },
        })
    });
    //For test we assume successful login

    //expect some text from Login component to notBeInDocument()

    //Do we render the Home component?
    //expect main navbar on Home to show logged in username
})



    // server.use(
    //     rest.get(`${BASE_API}/members/portfolio`, (req, res, ctx) => {
    ///GET req was successful
    //         return res(ctx.status(200), ctx.json({
                 //redirect to the Member Portfolio page
           //Use <Redirect to="members/portfolio" />?
    //         }))
    //     })
    // )
    //expect Login component to unmount
    //render.unmount();

//     As a developer,
// I need test if redirection post successful login works
// so that I can make sure user who has successfully logged-in 
// gets redirected to the homepage with the main navbar showing username of login user.

//test if user gets redirected to homepage with main navbar showing their username 
//after successful login