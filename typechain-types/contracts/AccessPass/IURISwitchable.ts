/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedListener,
  TypedContractMethod,
} from "../../common";

export interface IURISwitchableInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "getDisplayURI"
      | "getOriginalURI"
      | "setBaseDisplayURL"
      | "setBaseOriginalURL"
      | "switchURL"
      | "tokenURI"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "getDisplayURI",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getOriginalURI",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setBaseDisplayURL",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setBaseOriginalURL",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "switchURL", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "tokenURI",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "getDisplayURI",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getOriginalURI",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setBaseDisplayURL",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setBaseOriginalURL",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "switchURL", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "tokenURI", data: BytesLike): Result;
}

export interface IURISwitchable extends BaseContract {
  connect(runner?: ContractRunner | null): IURISwitchable;
  waitForDeployment(): Promise<this>;

  interface: IURISwitchableInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  getDisplayURI: TypedContractMethod<[tokenId: BigNumberish], [string], "view">;

  getOriginalURI: TypedContractMethod<
    [tokenId: BigNumberish],
    [string],
    "view"
  >;

  setBaseDisplayURL: TypedContractMethod<
    [baseURL: string],
    [void],
    "nonpayable"
  >;

  setBaseOriginalURL: TypedContractMethod<
    [baseURL: string],
    [void],
    "nonpayable"
  >;

  switchURL: TypedContractMethod<[], [void], "nonpayable">;

  tokenURI: TypedContractMethod<[tokenId: BigNumberish], [string], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "getDisplayURI"
  ): TypedContractMethod<[tokenId: BigNumberish], [string], "view">;
  getFunction(
    nameOrSignature: "getOriginalURI"
  ): TypedContractMethod<[tokenId: BigNumberish], [string], "view">;
  getFunction(
    nameOrSignature: "setBaseDisplayURL"
  ): TypedContractMethod<[baseURL: string], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setBaseOriginalURL"
  ): TypedContractMethod<[baseURL: string], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "switchURL"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "tokenURI"
  ): TypedContractMethod<[tokenId: BigNumberish], [string], "view">;

  filters: {};
}
