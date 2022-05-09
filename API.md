# API Specification

This is the specification we will plan on following for our application's REST API.

## Discoverability

All endpoints will point back to their version root (e.g. `/api/v1/`) which returns a list of all the available endpoints you can send requests to. It also returns the URL to the API root (`/api`) which returns each available version of the API. This makes our API fully discoverable but saves bandwidth for the functional endpoints that are frequently used.

## Authentication

This application is planned to support SAML 2.0 as the main and only way to authenticate in its initial release. For this, use the SAML2 SP protocol. More information on this will come later, if necessary.

During development, you may use a basic `Authorization` header on the `/login` endpoint, where the username is the user you want to log into and the password is a shared password set in your application's config file. This method of Authorization should only work on `localhost`, if the password is correct, and if the application was launched in development mode.

Once authenticated, the browser will receive a bearer token. This token can be sent to the API via the header `Authorization: Bearer <token>`. Eventually, this token will expire, the server will no longer recognize it as valid, and they will have to re-authenticate with the IdP. The client should automatically send a request to the `/login` endpoint.

## Modifications

This spec is not necessarily complete. As the app progresses and design choices are made, modifications to the spec may need to be made.

## Map

> `GET api/` - Returns all versions of the API. Used for discoverability.<br>
>> `GET v1/` - Returns all available endpoints. Used for discoverability.<br>
>>> `GET user/` - Gets the current user data. Requires auth. Returns: 200, 401<br>
>>> `PUT user/` - Creates a user. Returns: 201, 400<br>
>>>> `PATCH :id/` - Updates an already existing user. Requires auth. Returns: 200, 400, 401, 403, 404<br>
>>>> `DELETE :id/` - Deletes an already existing user. Requires auth. Returns: 204, 400, 401, 403, 404<br>
>>>> `GET :id/` - Gets a user. Requires auth. Returns: 200, 400, 401, 403, 404<br>
>>>> <br>
>>>> `GET login/` - Initiates login for a user via SAML 2.0. Requires NOT auth. Returns: 200, 403<br>
>>>>>`POST verify/` - Verify a given SAML response. Requires NOT auth. Returns: 200, 400, 401, 403<br>
>>>>
>>>> `GET logout/` - Logs out of a user, if logged in. Returns: 200<br>
>>>
>>> `GET classroom/` - Get a list of your current classrooms. Requires auth. Returns: 200, 401, 403<br>
>>> `POST classroom/` - Join a classroom via a classroom code. Requires auth. Returns: 200, 400, 401, 403, 404<br>
>>> `PUT classroom/` - Create a classroom. Requires auth. Returns: 200, 400, 401, 403<br>
>>>> `GET :id/` - Get a classroom with a specified ID. If the user is an Instructor, they may get different info from a Student. Requires auth. Returns: 200, 401, 403, 404<br>
>>>> `PATCH :id/` - Update classroom settings. Requires auth. Returns: 200, 400, 401, 403, 404<br>
>>>> `DELETE :id/` - Delete a classroom. Requires auth. Returns: 204, 401, 403, 404<br>
>>>>> `GET members/` - Get a list of members of this classroom, along with their role and a brief summary of their account. Requires auth. Returns: 200, 401, 403, 404<br>
>>>>> `PUT members/` - Add a user to this classroom. Requires auth. Returns: 200, 400, 401, 403, 404<br>
>>>>>> `GET :member/` - Get membership information about a specific member of this classroom. Requires auth. Returns: 200, 401, 403, 404<br>
>>>>>> `PATCH :member/` - Update membership status of a specific member of this classroom. Requires auth. Returns: 200, 400, 401, 403, 404<br>
>>>>>> `DELETE :member/` - Remove a member from this classroom. Can also remove yourself. Requires auth. Returns: 200, 401, 403, 404<br>
>>>
>>> `GET following/` - Get all of the crypto currencies you are currently following. Requies auth. Returns: 200, 401<br>
>>>> `PUT :ticker/` - Start following a given crypto currency. Requires auth. Returns: 200, 401, 404<br>
>>>> `DELETE :ticker/` - Stop following a given crypto currency. Requires auth. Returns: 200, 401, 404<br>
>>>
>>> `GET accounts/` - Get a list of accounts you own. Requires auth. Returns: 200, 401<br>
>>> `PUT accounts/` - Create a new personal account. Managed accounts are done via classrooms. Requires auth. Returns: 200, 400, 401<br>
>>>> `GET :id/` - Get information about a specific account you own or you manage. Requires auth. Returns: 200, 401, 403, 404<br>
>>>> `PATCH :id/` - Update information about your account, or the account you manage. Requires auth. Returns: 200, 401, 403, 404<br>
>>>> `DELETE :id/` - Delete an account, or an account you manage. Requires auth. Returns: 200, 401, 403, 404<br>
>>>
>>> `GET crypto/` - Get a list of crypto currencies. Returns: 200<br>
>>>> `POST :ticker/` - Submits a transaction to be processed for a given crypto currency under a given account. Requires auth. Returns: 202, 401<br>
>>>>> `GET :time/` - Get more detailed data about a given crypto currency for a given timespan. Returns: 200, 404<br>
>>>
>>> `GET leaderboard/` - Get a list of available leaderboards and their titles. Returns: 200<br>
>>>> `GET :id/` - Get all of the top positions on a given leaderboard. If authenticated, returns your position as well. Returns: 200, 404<br>
>>>>> `GET :user/` - Get a specific user's position on the leaderboard. Returns: 200, 404<br>
>>>
>>> `GET news/` - Get the latest crypto currency news. Returns: 200<br>

# Types

There are multiple types of objects and states of our application. We will be using a NoSQL database, however the content of this page is laid out in the form of a table to show all possible properties at the moment. This is a live document and will adapt as development progresses.

## User

Users are individual accounts from the SAML IdP authentication server.

### Account creation process 

This is my personal feedback on how account creation should go, but please add your own creativity if you think of anything.

#### Personal accounts
- A wallet is auto-created when the account is created.
- User is prompted to enter their starting balance.
- User is brought to their dashboard, where they can see their balance and buy and sell crypto currencies.
- On the dashboard, there is a button for the user to create new wallets.
- Users may go into their settings to create a new Blockchain.

#### Student account
- User does not have a wallet created for them.
- User is prompted to enter a classroom code.
- When the user joins the classroom, a wallet will automatically be generated for them, if the classroom has that set up.
- User is brought to dashboard, where they can see their classroom wallet, if one was created. If not, they see a message saying they don't have any wallets set up and to talk to their instructor.
- On the dashboard, there is a button for the user to create new wallets, and ask which instructors they want to grant access to, if any.
- Users may go into their settings to create a new Blockchain.

#### Instructor account
- User is asked if they want to set up a new Classroom.
  - Classroom name
  - Option to create a new Blockchain for the Classroom
  - Automatic generation of wallet for new students, + options
  - Option to generate class join code
- User is asked if they want to set up a personal wallet.
- User is brought to dashboard, where they can see all of their students.

For all users:
- When a user goes to the dashboard, if they do not have a wallet, they are told they don't have a wallet. Students are told to talk to instructor, Personal and Instructor are offered a link to make a new wallet.
- When a user has a single wallet, there should not be a way to select what wallet they're using, for the sake of simplicity.
- When a user has multiple wallets (this includes instructors), they have a dropdown of all wallets they have access to.

### Schema

| Property | Description | Required? |
|----------|-------------|-----------|
| `id` | SAML ID of this account. No strict requirements on how this ID is structured, as it will depend on the SAML IdP. Not necessarily unique! If the user controlling this SAML ID has deleted an account, it could still exist in the DB. However, there will be no duplicate non-deleted users. | Yes |
| `firstName` | First name of the user. May be able to get from SAML, otherwise ask on account creation. | No |
| `lastName` | Last name of the user. May be able to get from SAML, otherwise ask on account creation. | No |
| `created` | Timestamp of when this user was created. | No |
| `type` | Either "Personal", "Student", or "Instructor". If not set, presumably the user has not set up their user account yet and should be shown the intro screen. | No |
| `following` | Array of blockchain tickers which this user is following. | No |

## Session

Sessions are how a user is identified through multiple requests to the server over a period of time.

### Schema

| Property | Description | Required? |
|----------|-------------|-----------|
| `for` | Mongo object ID of the user which this session is for. Not to be confused with SAML ID. | Yes |
| `token` | Bearer token that was sent to the client when the session was created. Used to authenticate. | Yes |
| `created` | Timestamp of when this session was created. | Yes |
| `useragent` | User agent that created this session. Reserved for security checkups. | No |
| `ip` | IP that was used to create this session. Reserved for security checkups. | No |

## Classroom

Classrooms are a way for instructors to monitor the transactions of their students.

Admins can set up their classroom to automatically create a new wallet for students when they join, which will be linked to this classroom, giving the admins the ability to restrict wallet permissions. Classrooms should be able to control the following in the wallets they create:
- Deny students deleting the wallet
- Deny students (with admin permissions) from being able to add other users to the wallet
- Do not add students to wallet admin list when created
- Set starting balances for virtual blockchains upon creation
- Set starting balances for simple blockchains which are part of this classroom upon creation
- Auto-delete wallet when student leaves classroom

### Schema

| Property | Description | Required? |
|----------|-------------|-----------|
| `name` | Friendly name for this classroom. | No |
| `codes` | Array of codes which users can use to join the classroom. Having multiple codes allows the instructor to track how a user joined based off of what code they used. | No |
| `admins` | Array of Mongo object IDs referring to users who have admin permissions over this classroom. I.e., instructors. | Yes |
| `students` | Array of Mongo object IDs referring to users who are students within this classroom. Admins are auto-added to their classroom-created wallets, and therefore see all their transactions. | No |
| `autowallet` | Settings for the wallet automatically created when a student joins. If not provided then a wallet won't be auto-created. | No |

## Wallet

Wallets are central controllers over a set of funds. 

### Schema

| Property | Description | Required? |
|----------|-------------|-----------|
| `id` | Wallet identifier. Unique. This is what you use to send/receive funds. | Yes |
| `name` | Friendly name of this wallet, easier to read than the wallet ID. | No |
| `admins` | Array of Mongo object IDs for users which have Admin controls over a wallet. Admins are able to add/remove funds, revert virtual transactions, etc. | No |
| `members` | Array of Mongo object IDs for users which have basic controls over a wallet. Basic members are able to trade currencies with a wallet, but can't add new funds, etc. | No |
| `balance` | Object containing the balance of this wallet in different currencies, including dollars. | Yes |
| `classroom` | Mongo object ID of the classroom which created this wallet. Classrooms are able to restrict permissions of members for their wallets. Wallet admins are synced with classroom admins, with the option of including the student. | No |

### Differences from the real world

| Real World | Application |
|-------------|------------|
| Typically, you have a unique wallet for each currency. | Wallets are universal to all currencies. |
| In order to add or remove funds, they must come from a transaction. | Wallet balance can be altered by a wallet admin. |
| Wallets are completely anonymous and are controlled through a passphrase. Potential future feature to teach about security? | Members and Admins can see other Members and Admins who control the wallet. |

## Blockchain

Blockchains are essentially a currency. There are two types of blockchains:

### Virtual blockchains

Virtual blockchains are based on real-life blockchains, but don't include the full transaction chain. These types of blockchains cannot be created by users, and must be added to the database by a site admin. Users may exchange their wallet balance for currency on this blockchain by sending funds to a central wallet, which will buy and sell infinite currency at market value. Since it is virtual, their transaction has no impact on the market value. However, it will still appear on our own blockchain which other users can view (maybe).

### Simple blockchains

These are simple, local implementations of a blockchain within this application. These blockchains can be created by anyone and will have a set of administrators who are able to add funds into the pool, but cannot necessarily remove funds without removing them from the wallets of its users. Proof is not required, but can be enabled by the administrators. If proof is disabled, other methods of distribution may be selected, if desired.

In these blockchains, there is no central exchange wallet, since the market is too small to automate. Instead, market price is determined by whatever the lowest exchange rate for sale is currently available. If none are available, it's whatever the last exchange rate was. Users can go into a table to find other wallets which are offering exchanges, and then accept those offers, if they so please.

### Schema

| Property | Description | Required? |
|----------|-------------|-----------|
| `ticker` | Ticker of this currency. Must be unique. | Yes |
| `type` | Either "Virtual" or "Simple". | Yes |
| `admins` | A list of Mongo object IDs referring to the admins of this blockchain. Admins can add and remove from the exchange. Virtual blockchains don't have admins. |
| `exchange` | Exchange wallet identifier which will buy and sell at market value in virtual markets. In simple markets, they are responsible for distributing currency upon consensus. | No |
| `consensus_algorithm` | Algorithm to use for consensus (i.e. "proof of ____") on simple blockchains. Since the blockchain is centralized, proof is not necessary, but only for educational value and to stimulate the economy. | No |
| `classroom` | Classroom which this blockchain belongs to, if one exists. This automatically syncs the classroom and blockchain admin list, and allows admins to auto-add currencies to student wallets. | No |

### Differences from the real world

| Real World | Application |
|-------------|------------|
| Blockchains are at least partially decentralized, and therefore require a consensus algorithm. | All blockchains are centrally controlled, and therefore a consensus algorithm is not required. |
| Blockchains do not have a single exchange; instead they're created by the free market. | In virtual blockchains, an exchange is inherent as that is their sole purpose. |
| Blockchains are not required to have a ticker. | You must have a ticker for each blockchain in our application because wallets are universal. | 

## Transaction

Transactions are between two wallets upon a blockchain.

### Schema

| Property | Description | Required? |
|----------|-------------|-----------|
| `id` | Identifier for this transaction. Algorithmically generated based off of the previous ID. | Yes |
| `blockchain` | Blockchain which this transaction is on. | Yes |
| `to` | Wallet identifier that the funds are being sent to. | Yes |
| `from` | Wallet identifier that the funds are being sent from. | Yes |
| `initiator` | Since wallets can be shared, this is the Mongo object ID of the user who initiated this transaction. | No |
| `value` | Amount of currency which is being transferred. | Yes |
| `proven` | Whether or not this transaction has been proven. If the parent blockchain doesn't have a proof system enabled, this is just immediately true. | No |

### Differences from the real world

| Real World | Application |
|-------------|------------|
| The blockchain is the universal truth for all transactions, even ones outside of a given exchange (what our app is, essentially). | Blockchains are scoped to within this application only. |
| Transactions are final. | Transactions can be reversed by a market admin, as long as a new transaction has not yet been written on it. |
| Transactions must be proven. | Proof is not required, but a feature which can be enabled by market admins. |
| Transactions are often proven in bulk. | If proof is used, each transaction is proven individually due to the small market size. |