# Authentication Backend with NodeJS(NestJS) & Prisma
[Currently deployed on Heroku](https://nestjs-prisma-auth-backend.herokuapp.com/docs)

## ✨ Requirements

- node 14.15.0 또는 16.10.0 이상
- npm 8.7.0

## 📚 Tech Stacks

- Nestjs
- Prisma (ORM)
- Typescript
- Swagger
- Sqlite

## 📦 Init

```shell
$ npm install
```

## 🔨 Run

```shell
# development
$ npm run start:dev

# production
$ npm run build
$ npm run start:prod
```

## 📝 Api Docs

- dev 또는 prod 환경 실행중인 상태에서 `GET /docs` 호출 시 Swagger 문서 확인 가능
- 현재 Heroku에 배포해두어서, [Heroku](https://nestjs-prisma-auth-backend.herokuapp.com/docs)에서도 확인 가능

### 휴대폰 인증번호 생성
`POST /auth/phone/send_code`

#### parameters
- `phoneNumber` `<string>`

#### response
- `<string>`

### 휴대폰 인증번호 확인
`POST /auth/phone/verify_code`

#### parameters
- `phoneNumber` `<string>`
- `code` `<string>`

#### response
- `<boolean>`

### 회원가입
`POST /auth/register`
- 휴대폰 인증번호 생성, 확인을 먼저 한 후, 해당 인증번호까지 같이 POST합니다

#### parameters
- `email` `<string>`
- `nickname` `<string>`
- `password` `<string>`
- `name` `<string>`
- `phoneNumber` `<string>`
- `code` `<string>`

#### response
- `accessToken` `<string>`
- `refreshToken` `<string>`

### 로그인
`POST /auth/login`
- accessToken은 5시간, refreshToken은 7일간 유효합니다
- 로그인 후, 발급받은 accessToken 앞에 `Bearer `를 붙여서, Request Header의 `Authorization` 값으로 활용해주세요

#### parameters
- `loginType` `<string> (email, nickname, phoneNumber)`
- `loginValue` `<string>`
- `password` `<string>`

#### response
- `accessToken` `<string>`
- `refreshToken` `<string>`

### 로그아웃
`POST /auth/logout`
- 로그아웃 후, 기존에 사용하던 accessToken을 서버에서 무효화하는 작업은 별도로 되어있지 않습니다. 클라에서 로그아웃 시 토큰을 지워주세요

#### response
- `<boolean>`

### 비밀번호 찾기
`POST /auth/find_password`
- 회원가입과 마찬가지로, 휴대폰 인증번호 생성, 확인을 먼저 한 후, 해당 인증번호까지 같이 POST합니다

#### parameters
- `phoneNumber` `<string>`
- `code` `<string>`
- `newPassword` `<string>`

#### response
- `<boolean>`

### 전체 유저 간략 정보 보기
`GET /users`

#### response
- `Array`

### 내 정보 보기
`GET /users/profile`
- 로그인 상태(헤더 Authorization값이 `Bearer {token}`)일 때만 조회 가능

#### response
- `id` `<string>`
- `email` `<string>`
- `nickname` `<string>`
- `name` `<string>`
- `phoneNumber` `<string>`

### 유저 정보 보기
`GET /users/:id`
- 로그인 상태(헤더 Authorization값이 `Bearer {token}`)일 때만 조회 가능
- 본인 정보라면 내 정보 보기와 같은 양의 정보를 확인할 수 있으며, 타인이라면 이메일과 닉네임만 확인 가능

#### response
본인 정보
- `id` `<string>`
- `email` `<string>`
- `nickname` `<string>`
- `name` `<string>`
- `phoneNumber` `<string>`

타인 정보
- `email` `<string>`
- `nickname` `<string>`

## 🔍 특히 신경 쓴 부분

- 실제 프로덕션 환경과 최대한 비슷하게 Access Token, Refresh Token을 별도로 발급하여 관리할 수 있도록 설계해보았습니다.
- 보다 높은 수준의 보안을 위해 랜덤하게 생성된 passwordSalt를 유저 password 앞에 붙인 후 암호화하여 저장했습니다.