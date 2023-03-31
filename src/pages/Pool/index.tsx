import {useEffect, useState} from "react";
import {AllPairItem, getAllPairs} from "services/trade.service";
import {ChainId} from "10k_swap_sdk";
import {ColumnProps} from "antd/es/table";
import {Button, Table} from "antd";
import styles from './index.module.css';
import { IPool } from 'enums/types'
const Pool = () => {
  const [liquidities, setLiquidities] = useState<IPool[]>([])
  const [isFetching, setIsFetching] = useState(false)
  useEffect(() => {
    setIsFetching(true)
    getAllPairs(ChainId.MAINNET).then(ret => {
      setLiquidities(ret);
      setIsFetching(false)
    })
  }, [])

  const onAdd = () => {}
  const columns: ColumnProps<any>[] = [
    {
      key: 'name',
      title: 'Name',
      width: 200,
      render: (_, record: AllPairItem) => {
        const {token0, token1} = record;
        return <span>{token0.symbol} - {token1.symbol}</span>
      }
    },
    {
      key: 'liquidity',
      title: 'Liquidity',
      dataIndex: 'liquidity',
      width: 200,
      align: 'center',
      render: (value) => <span>$ {value.toFixed(2)}</span>
    },
    {
      key: 'add',
      title: 'Add',
      width: 200,
      align: 'center',
      render: () => {
        return <Button type='link' onClick={onAdd}>Add Liquidity</Button>
      }
    }
  ]
  return <div>
    <div className={styles.header}>Pools Overview</div>
    <Table dataSource={liquidities} columns={columns} pagination={false} loading={isFetching}/>
  </div>
}

export default Pool;
