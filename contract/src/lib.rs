#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env
};

#[contract]
pub struct CrowdfundContract;

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    Deadline,
    Target,
    Token,
    TotalPledged,
    Pledge(Address),
    Claimed,
}

#[contractimpl]
impl CrowdfundContract {
    pub fn init(
        env: Env,
        admin: Address,
        deadline: u64,
        target: i128,
        token: Address,
    ) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Deadline, &deadline);
        env.storage().instance().set(&DataKey::Target, &target);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::TotalPledged, &0i128);
        env.storage().instance().set(&DataKey::Claimed, &false);
    }

    pub fn pledge(env: Env, user: Address, amount: i128) {
        user.require_auth();

        let deadline: u64 = env.storage().instance().get(&DataKey::Deadline).unwrap();
        if env.ledger().timestamp() >= deadline {
            panic!("deadline passed");
        }

        let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let client = token::Client::new(&env, &token);
        
        client.transfer(&user, &env.current_contract_address(), &amount);

        let mut total_pledged: i128 = env.storage().instance().get(&DataKey::TotalPledged).unwrap();
        total_pledged += amount;
        env.storage().instance().set(&DataKey::TotalPledged, &total_pledged);

        let pledge_key = DataKey::Pledge(user.clone());
        let mut user_pledged: i128 = env.storage().persistent().get(&pledge_key).unwrap_or(0);
        user_pledged += amount;
        env.storage().persistent().set(&pledge_key, &user_pledged);
    }

    pub fn claim(env: Env) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let deadline: u64 = env.storage().instance().get(&DataKey::Deadline).unwrap();
        if env.ledger().timestamp() < deadline {
            panic!("deadline not passed");
        }

        let target: i128 = env.storage().instance().get(&DataKey::Target).unwrap();
        let total_pledged: i128 = env.storage().instance().get(&DataKey::TotalPledged).unwrap();

        if total_pledged < target {
            panic!("target not met");
        }

        let claimed: bool = env.storage().instance().get(&DataKey::Claimed).unwrap();
        if claimed {
            panic!("already claimed");
        }

        env.storage().instance().set(&DataKey::Claimed, &true);

        let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let client = token::Client::new(&env, &token);
        client.transfer(&env.current_contract_address(), &admin, &total_pledged);
    }

    pub fn refund(env: Env, user: Address) {
        let deadline: u64 = env.storage().instance().get(&DataKey::Deadline).unwrap();
        if env.ledger().timestamp() < deadline {
            panic!("deadline not passed");
        }

        let target: i128 = env.storage().instance().get(&DataKey::Target).unwrap();
        let total_pledged: i128 = env.storage().instance().get(&DataKey::TotalPledged).unwrap();

        if total_pledged >= target {
            panic!("target met, cannot refund");
        }

        let pledge_key = DataKey::Pledge(user.clone());
        let user_pledged: i128 = env.storage().persistent().get(&pledge_key).unwrap_or(0);
        if user_pledged == 0 {
            panic!("no pledge to refund");
        }

        env.storage().persistent().set(&pledge_key, &0i128);

        let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let client = token::Client::new(&env, &token);
        client.transfer(&env.current_contract_address(), &user, &user_pledged);
    }
    
    pub fn get_info(env: Env) -> (Address, u64, i128, Address, i128, bool) {
        let admin = env.storage().instance().get(&DataKey::Admin).unwrap();
        let deadline = env.storage().instance().get(&DataKey::Deadline).unwrap();
        let target = env.storage().instance().get(&DataKey::Target).unwrap();
        let token = env.storage().instance().get(&DataKey::Token).unwrap();
        let total_pledged = env.storage().instance().get(&DataKey::TotalPledged).unwrap();
        let claimed = env.storage().instance().get(&DataKey::Claimed).unwrap();
        (admin, deadline, target, token, total_pledged, claimed)
    }
}
