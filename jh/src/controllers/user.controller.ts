import { Request, Response } from "express";
// import userService from "../service/user.service";
const user = {
  id: 1,
  name: "홍길동",
  email: "test234@naver.com",
};

// GET - 쿼리로 ID 받기 - 변경 이뤄지지 않음. - 조회의 용도
export const getUser = (req: Request, res: Response) => {
  const id = req.query.id;
  // const user = userService.findUser(id);
  res.send(`여기에 데이터 형식이 들어감 : ${id}`);
};

// POST - JSON body 받기 - 변경 , 수정
export const createUser = (req: Request, res: Response) => {
  const { name, email } = req.body;
  console.log("Body", req.body);
  console.log("Param", req.params);
  console.log("Query", req.query);

  res.status(201).json({ message: "User created", name, email });
};

// PUT - 전체 정보 수정
export const updateUser = (req: Request, res: Response) => {
  // const id = req.params.id; // 이게 없는데
  const { name, email } = req.body;
  res.send(`PUT update user ${name} ${email} `);
};

// PATCH - 일부 정보 수정
export const patchUser = (req: Request, res: Response) => {
  // const id = req.params.id;
  const { email } = req.body;
  res.send(`PATCH update user's email to ${email}`);
};
//123
