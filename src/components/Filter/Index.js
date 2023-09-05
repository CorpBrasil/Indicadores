import { useState } from 'react'
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { ThemeProvider } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import moment from "moment";
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import { theme } from "../../data/theme"
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';

const Filter = ({ tableData, dataFull, sellers, userRef, changeFilter, type }) => {
  const [open] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchType, setSearchType] = useState('');
  const [viewPopover, setviewPopover] = useState(false);
  const [searchParams, setSearchParams] = useState([]);
  const openFilter = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const search = (type) => {
    if(type ==='atividade') {
      changeFilter(tableData.filter((item) => {return item.atividade === searchValue}));
      const newData = [...searchParams];
      newData.push({
        title: 'Atividade é',
        value: searchValue
      })
      handleClose();
      setSearchParams(newData);
    }else if(type === 'data') {
      const data1 = moment(searchValue[0]).format('YYYY-MM-DD');
      const data2 = moment(searchValue[1]).format('YYYY-MM-DD');
      changeFilter(tableData.filter((item) => 
          //  (moment(activity[0].createAt.seconds*1000) <= moment(searchValue[1]) && moment(searchValue[0]) >= moment(activity[0].createAt.seconds*1000))
          (moment(data1).isSameOrBefore(moment(item.createAt.seconds*1000).format('YYYY-MM-DD')) && moment(data2).isSameOrAfter(moment(item.createAt.seconds*1000).format('YYYY-MM-DD')))
        ));
      const newData = [...searchParams];
      newData.push({
        title: 'Data entre',
        value: moment(data1).format('DD/MM/YYYY') + ' - ' +  moment(data2).format('DD/MM/YYYY')
      })
      handleClose();
      setSearchParams(newData);
    }
     else if(type === 'empresa') {
       changeFilter(tableData.filter((item) => {return item.empresa.includes(searchValue)}));
       const newData = [...searchParams];
      newData.push({
        title: 'Empresa é',
        value: searchValue
      })
      handleClose();
      setSearchParams(newData);
    } else if(type === 'responsável') {
      changeFilter(tableData.filter((item) => {return item.responsavel.includes(searchValue)}));
      const newData = [...searchParams];
      newData.push({
        title: 'Responsável é',
        value: searchValue
      })
      handleClose();
      setSearchParams(newData);
    } else if(type === 'cidade') {
      changeFilter(tableData.filter((item) => {return item.cidade.includes(searchValue)}));
      const newData = [...searchParams];
      newData.push({
        title: 'Cidade é',
        value: searchValue
      })
      handleClose();
      setSearchParams(newData);
    } else if(type === 'consultora') {
      changeFilter(tableData.filter((item) => {return item.consultora === searchValue}));
      const newData = [...searchParams];
      newData.push({
        title: 'Consultora é',
        value: searchValue
      })
      handleClose();
      setSearchParams(newData);
    }
}

const handleClose = (type) => {
    setAnchorEl(null);
    setSearchValue('');
    setTimeout(() => {
      setviewPopover(false);
    }, 500);
};

const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const resetSearch = () => {
    setSearchParams([]);
    if(userRef && userRef.cargo === 'Vendedor(a)') {
      changeFilter(dataFull.filter((act) => act.uid === userRef.id))
    } else {
      changeFilter(dataFull);
    }
  }  


  return (
    <div className='filter-container'>
    <ThemeProvider theme={theme}>
      <Button aria-describedby={id} variant="outlined" color="primary" onClick={handleClick} startIcon={<AddCircleOutlineIcon />}>
      Adicionar Filtro
      </Button>
      <div className="filter-search">
      {searchParams && searchParams &&
      searchParams.map((item, index) => (
          <div key={index} className='filter-search-item'>
            <span>{item.title}</span>
            <span>{item.value}</span>
          </div>
      ))
    }
    {searchParams && searchParams.length > 0 &&
    <Button onClick={resetSearch} color="error"><CloseIcon /></Button>
    }
    </div>
    <Popover
    id={id}
    open={openFilter}
    anchorEl={anchorEl}
    className="filter"
    onClose={handleClose}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    PaperProps={{ style: { overflow: 'visible' } }}
    >
      {!viewPopover && !viewPopover ? 
      <div className="filter-box">
        <p className="filter-title">FILTROS</p>
        {type && type === 'Activity' && 
        <><div className="filter-item" onClick={() => { setviewPopover(true); setSearchType('atividade'); } }>Atividade<KeyboardArrowRightIcon /></div><div className="filter-item" onClick={() => { setviewPopover(true); setSearchType('data'); } }>Data<KeyboardArrowRightIcon /></div><div className="filter-item" onClick={() => { setviewPopover(true); setSearchType('empresa'); } }>Empresa<KeyboardArrowRightIcon /></div><div className="filter-item" onClick={() => { setviewPopover(true); setSearchType('responsável'); } }>Responsável<KeyboardArrowRightIcon /></div><div className="filter-item" onClick={() => { setviewPopover(true); setSearchType('cidade'); } }>Cidade<KeyboardArrowRightIcon /></div></>
      }
        {type && type === 'Visit' && 
        <>
        <div className="filter-item" onClick={() => { setviewPopover(true); setSearchType('visita'); } }>Visita<KeyboardArrowRightIcon /></div>
        <div className="filter-item" onClick={() => { setviewPopover(true); setSearchType('data'); } }>Data<KeyboardArrowRightIcon /></div>
        <div className="filter-item" onClick={() => { setviewPopover(true); setSearchType('cidade'); } }>Cidade<KeyboardArrowRightIcon /></div>
        <div className="filter-item" onClick={() => { setviewPopover(true); setSearchType('empresa'); } }>Cliente<KeyboardArrowRightIcon /></div></>
        }
        {userRef && (userRef.cargo === 'Administrador' || type === 'Visit') && 
          <div className="filter-item" onClick={() => {setviewPopover(true);  setSearchType('consultora')}}>Consultora<KeyboardArrowRightIcon /></div>
        }
      </div> :
      <div className="filter-box2">
          <div className="filter-header">
            <IconButton size="small" onClick={() => setviewPopover(false)} >
              <KeyboardArrowLeftIcon size="small" />
            </IconButton>
          <p className="filter-title">{searchType.toUpperCase()}</p>
          <IconButton size="small" onClick={handleClose}>
          <CloseIcon size="small" />
          </IconButton>
          </div>
          {searchType && searchType === 'atividade' &&
            <><div>É igual a</div>
            <FormControl margin="normal" fullWidth>
            <InputLabel id="demo-simple-select-label">Atividade</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={searchValue}
              label="Atividade"
              onChange={(e) => setSearchValue(e.target.value)}
            >
              <MenuItem value='Email'>Email</MenuItem>
              <MenuItem value='Ligação'>Ligação</MenuItem>
              <MenuItem value='WhatsApp'>WhatsApp</MenuItem>
            </Select>
            </FormControl></>
          }
          {searchType && searchType === 'data' &&
            <><div>É entre</div>
            <DateRangePicker 
            onChange={(value) => setSearchValue(value)} 
            value={searchValue}
             />
            </>
          }
          {searchType && (searchType === 'empresa' || searchType === 'responsável' || searchType === 'cidade' || searchType === 'Cliente') &&
            <><div>É igual a</div>
            <TextField
          margin="dense"
          label="Pesquisar"
          type="text"
          size="small"
          fullWidth
          value={searchValue}
          variant="outlined"
          onChange={(e) => setSearchValue(e.target.value)}
          /> </>
          }
          {searchType && searchType === 'consultora' &&
            <><div>É igual a</div>
            <FormControl margin="normal" fullWidth>
            <InputLabel id="demo-simple-select-label">Consultora</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={searchValue}
              label="Consultora"
              onChange={(e) => setSearchValue(e.target.value)}
            >
              {sellers.map((seller) => (
                <MenuItem value={seller.nome}>{seller.nome}</MenuItem>
              ))
              }
            </Select>
            </FormControl></>
          }
          <Button variant="contained" onClick={() => search(searchType)}>Aplicar</Button>
        </div>
    }
    </Popover>
    </ThemeProvider>   
    </div>
  )
}

export default Filter
